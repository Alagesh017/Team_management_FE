import axios from 'axios'
import { clientTimeIso, clientLocalDateYmd, withClientTime } from '../utils/clientTime'
import {
	loadStoredUser,
	updateStoredTokens,
	clearStoredUser,
	notifySessionExpired,
	notifyTokensRefreshed,
	isDefinitiveAuthFailure,
} from '../../features/auth/authStorage'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
	baseURL: API_URL,
})

let refreshInFlight = null

function attachClientTimeToBody(config) {
	const method = (config.method || 'get').toLowerCase()
	if (!['post', 'put', 'patch'].includes(method)) {
		return
	}
	if (config.data instanceof FormData) {
		if (!config.data.has('client_time')) {
			config.data.append('client_time', clientTimeIso())
		}
		return
	}
	if (config.data === undefined || config.data === null || config.data === '') {
		config.data = withClientTime(null)
		return
	}
	if (typeof config.data === 'object' && !Array.isArray(config.data)) {
		if (config.data.client_time == null || config.data.client_time === '') {
			config.data = { ...config.data, client_time: clientTimeIso() }
		}
	}
}

async function refreshAccessToken() {
	const stored = loadStoredUser()
	if (!stored?.refreshToken) {
		throw new Error('No refresh token')
	}
	const response = await axios.post(
		`${API_URL}/auth/refresh`,
		{},
		{
			headers: { Authorization: `Bearer ${stored.refreshToken}` },
		}
	)
	const data = response.data
	if (data.status !== 1 || !data.access_token) {
		throw new Error(data.message || 'Refresh failed')
	}
	const next = updateStoredTokens(data.access_token, data.refresh_token)
	if (next) notifyTokensRefreshed(next)
	return data.access_token
}

api.interceptors.request.use(
	(config) => {
		config.headers['X-Client-Time'] = clientTimeIso()
		config.headers['X-Client-Local-Date'] = clientLocalDateYmd()
		attachClientTimeToBody(config)
		const storedUser = loadStoredUser()
		if (storedUser?.accessToken) {
			config.headers.Authorization = `Bearer ${storedUser.accessToken}`
		}
		return config
	},
	(error) => Promise.reject(error)
)

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const original = error.config
		if (!original || original.skipAuthRefresh) {
			return Promise.reject(error)
		}
		if (error.response?.status !== 401) {
			return Promise.reject(error)
		}
		if (original.url?.includes('/auth/refresh') || original._authRetried) {
			if (isDefinitiveAuthFailure(error)) {
				clearStoredUser()
				notifySessionExpired()
			}
			return Promise.reject(error)
		}

		try {
			if (!refreshInFlight) {
				refreshInFlight = refreshAccessToken().finally(() => {
					refreshInFlight = null
				})
			}
			const newAccess = await refreshInFlight
			original._authRetried = true
			original.headers.Authorization = `Bearer ${newAccess}`
			return api(original)
		} catch (refreshError) {
			if (isDefinitiveAuthFailure(refreshError)) {
				clearStoredUser()
				notifySessionExpired()
			}
			return Promise.reject(refreshError)
		}
	}
)

export default api
export { clientTimeIso, clientLocalDateYmd, withClientTime, refreshAccessToken }

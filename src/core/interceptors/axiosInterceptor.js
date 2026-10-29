import axios from 'axios'
import { clientTimeIso, clientLocalDateYmd, withClientTime } from '../utils/clientTime'

const API_URL = import.meta.env.VITE_API_URL
console.log('API URL:', API_URL)

const api = axios.create({
	baseURL: API_URL,
})

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

// Add a request interceptor
api.interceptors.request.use(
	(config) => {
		console.log('Making request to:', config.baseURL + config.url)
		config.headers['X-Client-Time'] = clientTimeIso()
		config.headers['X-Client-Local-Date'] = clientLocalDateYmd()
		attachClientTimeToBody(config)
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			const { accessToken } = JSON.parse(storedUser)
			if (accessToken) {
				config.headers.Authorization = `Bearer ${accessToken}`
			}
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

export default api
export { clientTimeIso, clientLocalDateYmd, withClientTime }

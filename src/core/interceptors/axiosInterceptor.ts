/// <reference types="vite/client" />

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
	baseURL: API_URL,
})

// Add a request interceptor
api.interceptors.request.use(
	(config) => {
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

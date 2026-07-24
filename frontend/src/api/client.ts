import axios from 'axios'

/**
 * In development:  VITE_API_URL is not set, so baseURL = '/api'
 *                  Vite proxy forwards /api → http://localhost:8081/api
 *
 * In production (Vercel):  VITE_API_URL = https://keystone-api.onrender.com
 *                           baseURL = https://keystone-api.onrender.com/api
 */
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('keystone_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('keystone_token')
      localStorage.removeItem('keystone_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

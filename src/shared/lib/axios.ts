import axios, {
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from 'axios'
import { env } from '@/config/env'
import { APP_CONSTANTS } from '@/config/constants'
import { ROUTES } from '@/config/routes'

const axiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

function drainQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem(
        APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
      )

      if (!refreshToken) {
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER)
        window.location.assign(ROUTES.LOGIN)
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            if (originalRequest.headers) {
              ;(
                originalRequest.headers as Record<string, string>
              ).Authorization = `Bearer ${token}`
            }
            resolve(axiosInstance(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          '/v1/auth/refresh',
          { refreshToken },
        )
        const { accessToken } = data
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, accessToken)
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        drainQueue(accessToken)
        if (originalRequest.headers) {
          ;(originalRequest.headers as Record<string, string>).Authorization =
            `Bearer ${accessToken}`
        }
        return axiosInstance(originalRequest)
      } catch {
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER)
        window.location.assign(ROUTES.LOGIN)
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance

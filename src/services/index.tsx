import axios, { type AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import {
    HEADER_CSRF_TOKEN_KEY,
    PERMISSION_ACCESS_DENIED,
    PERMISSION_TOKEN_HAS_EXPIRED,
    PERMISSION_TOKEN_ILLEGAL,
    PERMISSION_TOKEN_REFRESH_SUCCESS,
    PERMISSION_UNAUTHORIZED,
    SYSTEM_REQUEST_TOO_FREQUENT
} from '@/constants/common.constants'
import { URL_LOGIN, URL_TOKEN } from '@/constants/urls.constants'
import ConfigLoader from '@/components/config/loader'
import { message } from '@/utils/common'
import { getRedirectUrl } from '@/utils/route'
import {
    getAccessToken,
    setAccessToken,
    getCsrfToken,
    setCsrfToken,
    removeAllToken
} from '@/utils/auth'

let systemConfig: SystemConfig | null = null
let service: AxiosInstance | null = null
let refreshTokenPromise: Promise<void> | undefined

export const initRequestConfig = async (): Promise<void> => {
    try {
        systemConfig = await ConfigLoader.loadConfig()
        console.log('Request config initialized successfully')
    } catch (error) {
        console.error('Failed to initialize request config:', error)
        throw error
    }
}

const getConfig = (): SystemConfig => {
    if (!systemConfig) {
        throw new Error('Request config not initialized. Call initRequestConfig first.')
    }
    return systemConfig
}

const createAxiosInstance = (apiUrl: string): AxiosInstance => {
    const instance = axios.create({
        baseURL: apiUrl,
        timeout: 3e4
    })

    instance.defaults.paramsSerializer = (params: Record<string, string>) => {
        return Object.keys(params)
            .filter((it) => {
                return Object.prototype.hasOwnProperty.call(params, it)
            })
            .reduce((pre, curr) => {
                return params[curr] !== null && params[curr] !== undefined
                    ? (pre !== '' ? pre + '&' : '') + curr + '=' + encodeURIComponent(params[curr])
                    : pre
            }, '')
    }

    return instance
}

const setupInterceptors = (instance: AxiosInstance, apiUrl: string) => {
    instance.interceptors.request.use(
        async (config) => {
            if (config.url === URL_LOGIN) {
                config.withCredentials = true
            }

            if (checkTokenIsExpired()) {
                await refreshAccessToken(apiUrl)
            }

            const token = getAccessToken()
            if (token) {
                config.headers.set('Authorization', `Bearer ${token}`)
            }

            return config
        },
        async (error) => {
            return await Promise.reject(error)
        }
    )

    instance.interceptors.response.use(
        (response: AxiosResponse<_Response<never>>) => {
            switch (response.data.code) {
                case PERMISSION_UNAUTHORIZED:
                    removeAllToken()
                    message
                        .error({
                            content: <strong>未登录</strong>,
                            key: 'NO_LOGIN'
                        })
                        .then(() => {
                            location.reload()
                        })
                    throw response?.data
                case PERMISSION_TOKEN_ILLEGAL:
                case PERMISSION_TOKEN_HAS_EXPIRED:
                    removeAllToken()
                    message
                        .error({
                            content: <strong>登录已过期</strong>,
                            key: 'LOGIN_HAS_EXPIRED'
                        })
                        .then(() => {
                            location.replace(
                                getRedirectUrl('/login', `${location.pathname}${location.search}`)
                            )
                        })
                    throw response?.data
                case PERMISSION_ACCESS_DENIED:
                    void message.error({
                        content: <strong>暂无权限操作</strong>,
                        key: 'ACCESS_DENIED'
                    })
                    throw response?.data
                case SYSTEM_REQUEST_TOO_FREQUENT:
                    void message.warning({
                        content: <strong>请求过于频繁，请稍后重试</strong>,
                        key: 'REQUEST_TOO_FREQUENT'
                    })
                    throw response?.data
            }
            return response
        },
        async (error: AxiosError) => {
            if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
                return Promise.reject(error)
            }

            if (
                error.code === 'ETIMEDOUT' ||
                (error.code === 'ECONNABORTED' && error.message.includes('timeout'))
            ) {
                void message.error({ content: '请求超时，请稍后重试', key: 'TIMEOUT' })
            } else if (error.code === 'ERR_NETWORK') {
                void message.error({
                    content: (
                        <>
                            <strong>网络错误</strong>，请检查网络后重试
                        </>
                    ),
                    key: 'NETWORK_ERROR'
                })
            } else {
                void message.error({
                    content: (
                        <>
                            <strong>服务器出错</strong>，请稍后重试
                        </>
                    ),
                    key: 'SERVER_ERROR'
                })
            }
            throw error?.response?.data
        }
    )
}

const getService = (): AxiosInstance => {
    const { apiUrl } = getConfig()

    if (!service) {
        service = createAxiosInstance(apiUrl)
        setupInterceptors(service, apiUrl)
    }

    return service
}

export const recreateService = (): void => {
    service = null
}

const checkTokenIsExpired = () => {
    const accessToken = getAccessToken()
    if (!accessToken) {
        return false
    }
    const jwt = jwtDecode<JwtPayload>(accessToken)
    if (!jwt.exp) {
        return true
    }
    return jwt.exp * 1e3 - new Date().getTime() < 3e4
}

const refreshAccessToken = async (apiUrl: string): Promise<void> => {
    if (refreshTokenPromise) {
        return refreshTokenPromise
    }

    refreshTokenPromise = (async () => {
        const csrfToken = getCsrfToken()
        const headers: Record<string, string> = {
            'X-Requested-With': 'XMLHttpRequest'
        }
        if (csrfToken) {
            headers[HEADER_CSRF_TOKEN_KEY] = csrfToken
        }

        const res = await axios.post<_Response<TokenVo>>(URL_TOKEN, undefined, {
            baseURL: apiUrl,
            withCredentials: true,
            headers
        })
        const response = res.data
        if (response.code === PERMISSION_TOKEN_REFRESH_SUCCESS && response.data) {
            setAccessToken(response.data.accessToken)
            setCsrfToken(response.data.csrfToken)
        }
    })().finally(() => {
        refreshTokenPromise = undefined
    })

    return refreshTokenPromise
}

const request = {
    async get<T>(
        url: string,
        data?: object,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('GET', url, { ...config, params: data })
    },
    async post<T>(
        url: string,
        data?: object | string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('POST', url, { ...config, data })
    },
    async put<T>(
        url: string,
        data?: object | string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('PUT', url, { ...config, data })
    },
    async patch<T>(
        url: string,
        data?: object | string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('PATCH', url, { ...config, data })
    },
    async delete<T>(
        url: string,
        data?: object | string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('DELETE', url, { ...config, data })
    },
    async request<T>(
        method = 'GET',
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<_Response<T>>> {
        return await new Promise((resolve, reject) => {
            const service = getService()
            service({ method, url, ...config })
                .then((res) => {
                    resolve(res as unknown as Promise<AxiosResponse<_Response<T>>>)
                })
                .catch((e: Error | AxiosError) => {
                    reject(e)
                })
        })
    }
}

export default request

import { jwtDecode, JwtPayload } from 'jwt-decode'
import axios from 'axios'
import {
    PERMISSION_TOKEN_REFRESH_SUCCESS,
    HEADER_CSRF_TOKEN_KEY
} from '@/constants/common.constants'
import { URL_TOKEN } from '@/constants/urls.constants'
import { useConfigValues } from '@/components/config/ConfigContext'
import {
    getAccessToken,
    setAccessToken,
    getCsrfToken,
    setCsrfToken,
    removeAllToken
} from '@/utils/auth'

export const useTokenRefresh = () => {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [apiUrl, tokenExpiryBufferMs, tokenExpiryCheckIntervalMs] = useConfigValues([
        'apiUrl',
        'tokenExpiryBufferMs',
        'tokenExpiryCheckIntervalMs'
    ])

    useEffect(() => {
        const checkAndRefresh = async () => {
            const token = getAccessToken()
            if (!token) {
                return
            }

            let exp: number
            try {
                const jwt = jwtDecode<JwtPayload>(token)
                if (!jwt.exp) {
                    return
                }

                exp = jwt.exp * 1000
            } catch {
                return
            }

            const timeLeft = exp - Date.now()

            if (timeLeft > 0 && timeLeft < tokenExpiryBufferMs) {
                try {
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
                    if (res.data.code === PERMISSION_TOKEN_REFRESH_SUCCESS && res.data.data) {
                        setAccessToken(res.data.data.accessToken)
                        setCsrfToken(res.data.data.csrfToken)
                    } else {
                        removeAllToken()
                    }
                } catch {
                    /* empty */
                }
            }
        }

        intervalRef.current = setInterval(checkAndRefresh, tokenExpiryCheckIntervalMs)
        void checkAndRefresh()

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])
}

export default useTokenRefresh

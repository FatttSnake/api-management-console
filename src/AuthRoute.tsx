import { PRODUCTION_NAME } from '@/constants/common.constants'
import useTokenRefresh from '@/hooks/useTokenRefresh'
import { setPageTitle } from '@/utils/common'
import { getRedirectUrl } from '@/utils/route'
import { getLoginStatus, getVerifyStatus } from '@/utils/auth'

const AuthRoute = () => {
    const [searchParams] = useSearchParams()
    const matches = useMatches()
    const lastMatch = matches.reduce((_, second) => second)
    const handle = lastMatch.handle as RouteHandle
    const location = useLocation()
    const outlet = useOutlet()
    const isLogin = getLoginStatus()
    const isVerify = getVerifyStatus()

    useTokenRefresh()

    return useMemo(() => {
        setPageTitle(
            `${handle?.titlePrefix ?? ''}${
                handle?.title ? handle?.title : PRODUCTION_NAME
            }${handle?.titlePostfix ?? ''}`
        )

        if (matches.some(({ handle }) => (handle as RouteHandle)?.auth)) {
            if (!isLogin) {
                return (
                    <Navigate
                        replace
                        to={getRedirectUrl('/login', `${lastMatch.pathname}${location.search}`)}
                    />
                )
            }
            if (!isVerify && lastMatch.pathname !== '/verify') {
                return <Navigate to={'/verify'} />
            }
        }
        if (isLogin && ['/login', '/forget'].includes(lastMatch.pathname)) {
            if (searchParams.has('redirect')) {
                return <Navigate to={searchParams.get('redirect') ?? '/'} />
            } else {
                return <Navigate to={'/'} />
            }
        }

        if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
            return <Navigate to={location.pathname.substring(0, location.pathname.length - 1)} />
        }

        return outlet
    }, [
        handle?.title,
        handle?.titlePostfix,
        handle?.titlePrefix,
        isLogin,
        lastMatch.pathname,
        location.search,
        matches,
        outlet
    ])
}

export default AuthRoute

import { getAuthRoute } from '@/utils/route'

export const userZone: RouteJsonObject[] = [
    {
        path: '',
        absolutePath: '',
        element: <Navigate to="/api-keys" replace />
    },
    {
        path: 'apis',
        absolutePath: '/apis',
        id: 'user-apis',
        component: lazy(() => import('@/pages/User/Apis')),
        name: '可用 API',
        icon: lazy(() => import('~icons/console/api')),
        menu: true
    },
    {
        path: 'usage',
        absolutePath: '/usage',
        id: 'user-usage',
        component: lazy(() => import('@/pages/User/Usage')),
        name: '用量信息',
        icon: lazy(() => import('~icons/console/chart')),
        menu: true
    },
    {
        path: 'api-keys',
        absolutePath: '/api-keys',
        id: 'user-keys',
        component: lazy(() => import('@/pages/User/Keys')),
        name: 'API Keys',
        icon: lazy(() => import('~icons/console/key')),
        menu: true
    },
    {
        path: 'billing',
        absolutePath: '/billing',
        id: 'user-billing',
        component: lazy(() => import('@/pages/User/Billing')),
        name: '账单',
        icon: lazy(() => import('~icons/console/billing')),
        menu: true
    },
    {
        path: 'profile',
        absolutePath: '/profile',
        id: 'user-profile',
        component: lazy(() => import('@/pages/User/Profile')),
        name: '个人档案',
        icon: lazy(() => import('~icons/console/user'))
    }
]

export const getUserZoneRouteJson = () => getAuthRoute(userZone)

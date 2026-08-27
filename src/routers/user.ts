import { getAuthRoute } from '@/utils/route'

export const userZone: RouteJsonObject[] = [
    {
        path: 'profile',
        absolutePath: '/profile',
        id: 'user-profile',
        component: lazy(() => import('@/pages/User/Profile')),
        name: '个人档案',
        icon: lazy(() => import('~icons/console/user')),
        menu: true
    }
]

export const getUserZoneRouteJson = () => getAuthRoute(userZone)

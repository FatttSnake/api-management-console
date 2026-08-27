import { getAuthRoute } from '@/utils/route'

export const systemZone: RouteJsonObject[] = [
    {
        path: 'statistics',
        absolutePath: '/system/statistics',
        id: 'system-statistics',
        component: lazy(() => import('@/pages/System/Statistics')),
        name: '系统概况',
        icon: lazy(() => import('~icons/console/chart')),
        menu: true,
        permission: true
    },
    {
        path: 'settings',
        absolutePath: '/system/settings',
        id: 'system-settings',
        component: lazy(() => import('@/pages/System/Settings')),
        name: '系统设置',
        icon: lazy(() => import('~icons/console/option')),
        menu: true,
        permission: true
    },
    {
        path: 'user',
        absolutePath: '/system/user',
        id: 'system-user',
        component: lazy(() => import('@/pages/System/User')),
        name: '用户管理',
        icon: lazy(() => import('~icons/console/user')),
        menu: true,
        permission: true
    },
    {
        path: 'role',
        absolutePath: '/system/role',
        id: 'system-role',
        component: lazy(() => import('@/pages/System/Role')),
        name: '角色管理',
        icon: lazy(() => import('~icons/console/role')),
        menu: true,
        permission: true
    },
    {
        path: 'group',
        absolutePath: '/system/group',
        id: 'system-group',
        component: lazy(() => import('@/pages/System/Group')),
        name: '群组管理',
        icon: lazy(() => import('~icons/console/group')),
        menu: true,
        permission: true
    },
    {
        path: 'log',
        absolutePath: '/system/log',
        id: 'system-log',
        component: lazy(() => import('@/pages/System/Log')),
        name: '系统日志',
        icon: lazy(() => import('~icons/console/log')),
        menu: true,
        permission: true
    }
]

export const getSystemZoneRouteJson = () => getAuthRoute(systemZone)

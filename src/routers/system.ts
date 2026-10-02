import { getAuthRoute } from '@/utils/route'

export const systemZone: RouteJsonObject[] = [
    {
        path: 'monitor',
        absolutePath: '/system/operations/monitor',
        id: 'system-operations-monitor-dashboard',
        component: lazy(() => import('@/pages/System/Operations/Monitor')),
        name: '监控看板',
        icon: lazy(() => import('~icons/console/chart')),
        menu: true,
        permission: true
    },
    {
        path: 'plugin',
        absolutePath: '/system/plugin',
        id: 'system-plugin',
        name: '插件管理',
        icon: lazy(() => import('~icons/console/plugin')),
        menu: true,
        permission: true,
        children: [
            {
                path: '',
                absolutePath: '/system/plugin',
                id: 'system-plugin-index',
                component: lazy(() => import('@/pages/System/Plugin')),
                name: '插件',
                menu: true,
                permission: true
            },
            {
                path: 'key',
                absolutePath: '/system/plugin/key',
                id: 'system-plugin-key',
                component: lazy(() => import('@/pages/System/Plugin/PluginTrustKey')),
                name: '签名',
                menu: true,
                permission: true
            },
            {
                path: 'config/:pluginId',
                absolutePath: '/system/plugin/config',
                id: 'system-plugin-config',
                component: lazy(() => import('@/pages/System/Plugin/Config')),
                name: '插件配置',
                menu: false,
                permission: true
            }
        ]
    },
    {
        path: 'interface',
        absolutePath: '/system/interface',
        id: 'system-interface',
        component: lazy(() => import('@/pages/System/Interface')),
        name: '接口管理',
        icon: lazy(() => import('~icons/console/api')),
        menu: true,
        permission: true
    },
    {
        path: 'api-keys/:userId',
        absolutePath: '/system/api-keys',
        id: 'system-api-keys',
        component: lazy(() => import('@/pages/System/Keys')),
        name: '密钥管理',
        icon: lazy(() => import('~icons/console/key')),
        menu: false,
        permission: true
    },
    {
        path: 'operations',
        absolutePath: '/system/operations/account',
        id: 'system-operations',
        name: '运营管理',
        icon: lazy(() => import('~icons/console/operations')),
        menu: true,
        permission: true,
        children: [
            {
                path: 'usage/:userId',
                absolutePath: '/system/operations/usage',
                id: 'system-operations-usage',
                component: lazy(() => import('@/pages/System/Operations/Usage')),
                name: '用量信息',
                permission: true
            },
            {
                path: 'account',
                absolutePath: '/system/operations/account',
                id: 'system-operations-account',
                component: lazy(() => import('@/pages/System/Operations/Account')),
                name: 'API 账户',
                menu: true,
                permission: true
            },
            {
                path: 'transactions/:userId',
                absolutePath: '/system/operations/transactions',
                id: 'system-operations-transactions',
                component: lazy(() => import('@/pages/System/Operations/Transactions')),
                name: '账单',
                permission: true
            },
            {
                path: 'monitor',
                absolutePath: '/system/operations/monitor',
                id: 'system-operations-monitor',
                component: lazy(() => import('@/pages/System/Operations/Monitor')),
                name: '监控',
                menu: true,
                permission: true
            },
            {
                path: 'report',
                absolutePath: '/system/operations/report',
                id: 'system-operations-report',
                component: lazy(() => import('@/pages/System/Operations/Report')),
                name: '报表',
                menu: true,
                permission: true
            },
            {
                path: 'audit',
                absolutePath: '/system/operations/audit',
                id: 'system-operations-audit',
                component: lazy(() => import('@/pages/System/Operations/Audit')),
                name: '审计',
                menu: true,
                permission: true
            }
        ]
    },
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

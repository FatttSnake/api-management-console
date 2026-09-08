import { userZone } from '@/routers/user.tsx'
import { systemZone } from '@/routers/system'

export const framework: RouteJsonObject[] = [
    {
        path: '',
        absolutePath: '',
        children: userZone
    },
    {
        path: 'system',
        absolutePath: '/system',
        children: systemZone,
        permission: true
    },
    {
        path: '*',
        absolutePath: '*',
        element: <Navigate to="/api-keys" replace />
    }
]

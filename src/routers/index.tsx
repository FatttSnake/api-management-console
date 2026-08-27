import { cloneDeep } from 'lodash'
import { getAuthRoute, mapJsonToRoute, setTitle } from '@/utils/route'
import { framework } from '@/routers/framework.tsx'

export const getRouter = () => {
    const lazySignPage = lazy(() => import('@/pages/Sign'))

    const root: RouteJsonObject[] = [
        {
            path: '/',
            absolutePath: '/',
            component: lazy(() => import('@/AuthRoute')),
            children: [
                {
                    path: 'register',
                    absolutePath: '/register',
                    id: 'register',
                    component: lazySignPage
                },
                {
                    path: 'verify',
                    absolutePath: '/verify',
                    id: 'verify',
                    component: lazySignPage
                },
                {
                    path: 'forget',
                    absolutePath: '/forget',
                    id: 'forget',
                    component: lazySignPage
                },
                {
                    path: 'login',
                    absolutePath: '/login',
                    id: 'login',
                    component: lazySignPage
                },
                {
                    path: '',
                    absolutePath: '/',
                    id: 'framework',
                    component: lazy(() => import('@/pages/Framework')),
                    children: setTitle(framework, 'API Management'),
                    name: 'API Management',
                    auth: true
                },
                {
                    path: '*',
                    absolutePath: '*',
                    element: <Navigate to="/" replace />
                }
            ]
        }
    ]

    return createBrowserRouter(mapJsonToRoute(getAuthRoute(cloneDeep(root))))
}

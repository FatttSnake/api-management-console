import { getAuthRoute } from '@/utils/route'

export const framework: RouteJsonObject[] = []

export const getRouteJson = () => getAuthRoute(framework, true)

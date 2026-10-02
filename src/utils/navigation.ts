import { NavigateFunction, NavigateOptions } from 'react-router'
import { getRedirectUrl } from '@/utils/route'

export const navigateToRoot = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/', options)
}

export const navigateToLogin = (
    navigate: NavigateFunction,
    locationSearch?: string,
    redirectUrl?: string,
    options?: NavigateOptions
) => {
    navigate(
        redirectUrl ? getRedirectUrl('/login', redirectUrl) : `/login${locationSearch}`,
        options
    )
}

export const navigateToRedirect = (
    navigate: NavigateFunction,
    searchParams: URLSearchParams,
    defaultUrl: '/repository' | '/',
    options?: NavigateOptions
) => {
    navigate(searchParams.get('redirect') ?? defaultUrl, options)
}

export const navigateToForget = (
    navigate: NavigateFunction,
    locationSearch: string,
    options?: NavigateOptions
) => {
    navigate(`/forget/${locationSearch}`, options)
}

export const navigateToRegister = (
    navigate: NavigateFunction,
    locationSearch: string,
    options?: NavigateOptions
) => {
    navigate(`/register/${locationSearch}`, options)
}

export const navigateToProfile = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/profile', options)
}

export const navigateToApiKeys = (
    navigate: NavigateFunction,
    userId: string,
    options?: NavigateOptions
) => {
    navigate(`/system/api-keys/${userId}`, options)
}

export const navigateToUserManagement = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/system/user', options)
}

export const navigateToPluginManagement = (
    navigate: NavigateFunction,
    options?: NavigateOptions
) => {
    navigate('/system/plugin', options)
}

export const navigateToPluginConfig = (
    navigate: NavigateFunction,
    pluginId: string,
    options?: NavigateOptions
) => {
    navigate(`/system/plugin/config/${pluginId}`, options)
}

export const navigateToUsage = (
    navigate: NavigateFunction,
    userId: string,
    options?: NavigateOptions
) => {
    navigate(`/system/operations/usage/${userId}`, options)
}

export const navigateToApiAccount = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/system/operations/account', options)
}

export const navigateToTransactions = (
    navigate: NavigateFunction,
    userId: string,
    options?: NavigateOptions
) => {
    navigate(`/system/operations/transactions/${userId}`, options)
}

export const checkIsSamePathname = (a: string, b: string) => {
    const aPathname = a.substring(0, a.indexOf('?') === -1 ? a.length : a.indexOf('?'))
    const bPathname = b.substring(0, b.indexOf('?') === -1 ? b.length : b.indexOf('?'))

    return aPathname === bPathname
}

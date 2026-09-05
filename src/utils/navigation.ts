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

export const checkIsSamePathname = (a: string, b: string) => {
    const aPathname = a.substring(0, a.indexOf('?') === -1 ? a.length : a.indexOf('?'))
    const bPathname = b.substring(0, b.indexOf('?') === -1 ? b.length : b.indexOf('?'))

    return aPathname === bPathname
}

export const getQueryVariable = (variable: string) => {
    const query = window.location.search.substring(1)
    const vars = query.split('&')
    for (const value of vars) {
        const pair = value.split('=')
        if (pair[0] === variable) {
            return decodeURIComponent(pair[1].replace(/\+/g, ' '))
        }
    }
    return null
}

export const setCookie = (
    name: string,
    value: string,
    options: {
        daysToLive?: number | null
        path?: string | null
        domain?: string | null
        secure?: boolean
        sameSite?: 'Strict' | 'Lax' | 'None' | string
    } = {}
) => {
    let cookie = `${name}=${encodeURIComponent(value)}`
    if (typeof options.daysToLive === 'number') {
        cookie += `; max-age=${options.daysToLive * 24 * 60 * 60}`
    }
    if (options.path) {
        cookie += `; path=${options.path}`
    }
    if (options.domain) {
        cookie += `; domain=${options.domain}`
    }
    let needSecure = options.secure
    if (options.sameSite) {
        const sameSite = options.sameSite.toLowerCase()
        const validValues = ['strict', 'lax', 'none']

        if (validValues.includes(sameSite)) {
            const formatted = sameSite.charAt(0).toUpperCase() + sameSite.slice(1)
            cookie += `; SameSite=${formatted}`

            // 自动为 None 添加 Secure
            if (sameSite === 'none') {
                needSecure = true
            }
        } else {
            console.warn(`Invalid SameSite value: ${options.sameSite}`)
        }
    }
    if (needSecure) {
        cookie += '; Secure'
    }

    document.cookie = cookie
}

export const getCookie = (name: string) => {
    const cookies = document.cookie.split(';')

    return parseCookie(cookies, name)
}

export const parseCookie = (cookies: string[] | undefined, name: string) => {
    if (!cookies) {
        return null
    }

    const target = cookies.find((c) => c.startsWith(`${name}=`))
    return target ? decodeURIComponent(target.split(';')[0].split('=')[1]) : null
}

export const removeCookie = (name: string) => {
    document.cookie = `${name}=; max-age=0`
}

export const setLocalStorage = (name: string, value: string) => {
    localStorage.setItem(name, value)
    window.dispatchEvent(new Event('localStorageChange'))
}

export const getLocalStorage = (name: string) => {
    return localStorage.getItem(name)
}

export const removeLocalStorage = (name: string) => {
    localStorage.removeItem(name)
}

export const clearLocalStorage = () => {
    localStorage.clear()
}

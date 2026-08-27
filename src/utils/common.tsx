import { createRoot } from 'react-dom/client'
import { MessageInstance } from 'antd/es/message/interface'
import { HookAPI } from 'antd/es/modal/useModal'
import { NotificationInstance } from 'antd/es/notification/interface'
import { floor } from 'lodash'
import {
    STORAGE_COLLAPSE_SIDEBAR_KEY,
    STORAGE_THEME_MODE_KEY,
    THEME_DARK,
    THEME_FOLLOW_SYSTEM,
    THEME_LIGHT
} from '@/constants/common.constants'
import { getLocalStorage, setLocalStorage } from '@/utils/browser'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'

export type ThemeMode = typeof THEME_FOLLOW_SYSTEM | typeof THEME_LIGHT | typeof THEME_DARK

let message: MessageInstance
let notification: NotificationInstance
let modal: HookAPI

export const init = (
    messageInstance: MessageInstance,
    notificationInstance: NotificationInstance,
    modalInstance: HookAPI
) => {
    message = messageInstance
    notification = notificationInstance
    modal = modalInstance
}

export { message, notification, modal }

export const randomInt = (start: number, end: number) => {
    if (start > end) {
        const t = start
        start = end
        end = t
    }
    start = Math.ceil(start)
    end = Math.floor(end)
    return start + Math.floor(Math.random() * (end - start))
}

export const randomFloat = (start: number, end: number) => {
    return start + Math.random() * (end - start)
}

export const randomColor = (start: number, end: number) => {
    return `rgb(${randomInt(start, end)},${randomInt(start, end)},${randomInt(start, end)})`
}

export const floorNumber = (num: number, digits: number) => {
    if (digits > 0) {
        return Math.floor(num / Math.pow(10, digits - 1)) * Math.pow(10, digits - 1)
    } else {
        const regExpMatchArray = num.toString().match(new RegExp('^\\d\\.\\d{' + -digits + '}'))
        if (regExpMatchArray !== null) {
            return parseFloat(regExpMatchArray[0]).toFixed(-digits)
        } else {
            return num
        }
    }
}

export const showLoadingMask = (id: string) => {
    if (document.querySelector(`#${id}`)) {
        return
    }

    const container = document.createElement('div')
    document.body.appendChild(container)
    container.id = id
    container.setAttribute(
        'style',
        'position: fixed; width: 100vw; height: 100vh; z-index: 10000; left: 0; top: 0;'
    )

    return createRoot(container).render(<FullscreenLoadingMask />)
}

export const removeLoadingMask = (id: string) => {
    document.querySelectorAll(`#${id}`).forEach((value) => {
        value.parentNode?.removeChild(value)
    })
}

export enum ByteUnit {
    B = 'B',
    KiB = 'KiB',
    Mib = 'Mib',
    GiB = 'GiB',
    TiB = 'TiB',
    PiB = 'PiB',
    EiB = 'EiB',
    ZiB = 'ZiB',
    YiB = 'YiB'
}

export const formatByteSize = (byteSize: number): string => {
    const BASE = 1024
    if (byteSize <= -1) {
        return byteSize.toString()
    }

    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.B)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.KiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.Mib)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.GiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.TiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.PiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.EiB)
    }

    byteSize /= BASE
    if (floor(byteSize / BASE) <= 0) {
        return formatByte(byteSize, ByteUnit.ZiB)
    }

    byteSize /= BASE
    return formatByte(byteSize, ByteUnit.YiB)
}

const formatByte = (size: number, unit: ByteUnit): string => {
    let precision: number
    if ((size * 1000) % 10 > 0) {
        precision = 3
    } else if ((size * 100) % 10 > 0) {
        precision = 2
    } else if ((size * 10) % 10 > 0) {
        precision = 1
    } else {
        precision = 0
    }

    return `${size.toFixed(precision)}${unit}`
}

export const checkDesktop = () => import.meta.env.VITE_PLATFORM === 'DESKTOP'

export const omitText = (text: string, length: number) => {
    if (text.length <= length) {
        return text
    }
    return `${text.substring(0, length)}...`
}

const getByteLength = (str: string) => {
    let length = 0
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            length += 2
        } else {
            length++
        }
    }

    return length
}

const substringByByte = (str: string, start: number, length: number) => {
    let byteLength = 0
    let result = ''

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i)
        byteLength += charCode > 255 ? 2 : 1

        if (byteLength > start + length) {
            break
        } else if (byteLength > start) {
            result += str[i]
        }
    }

    return result
}

export const omitTextByByte = (text: string, length: number) => {
    if (getByteLength(text) <= length) {
        return text
    }
    return `${substringByByte(text, 0, length)}...`
}

export const getSidebarCollapse = () => getLocalStorage(STORAGE_COLLAPSE_SIDEBAR_KEY) === 'true'

export const setSidebarCollapse = (isCollapse: boolean) => {
    setLocalStorage(STORAGE_COLLAPSE_SIDEBAR_KEY, isCollapse ? 'true' : 'false')
}

export const getThemeMode = (): ThemeMode => {
    switch (getLocalStorage(STORAGE_THEME_MODE_KEY)) {
        case THEME_FOLLOW_SYSTEM:
        case THEME_LIGHT:
        case THEME_DARK:
            return getLocalStorage(STORAGE_THEME_MODE_KEY) as ThemeMode
        default:
            return THEME_FOLLOW_SYSTEM
    }
}

export const setThemeMode = (themeMode: ThemeMode) => {
    setLocalStorage(STORAGE_THEME_MODE_KEY, themeMode)
}

export const setPageFavicon = (url?: string) => {
    const pageIcon: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
    pageIcon && (pageIcon.href = url ?? '/logo.svg')
}

export const setPageTitle = (title: string) => {
    document.title = title
}

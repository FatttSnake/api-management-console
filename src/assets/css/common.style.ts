import { createGlobalStyle } from 'antd-style'

export default createGlobalStyle(() => ({
    '.center-box': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    '.vertical-center-box': { display: 'flex', alignItems: 'center' },
    '.horizontal-center-box': { display: 'flex', justifyContent: 'center' },
    '.icon-size-xs': {
        width: 16,
        height: 16,
        '> use': { width: 16, height: 16 }
    },
    '.icon-size-sm': {
        width: 20,
        height: 20,
        '> use': { width: 20, height: 20 }
    },
    '.icon-size-md': {
        width: 24,
        height: 24,
        '> use': { width: 24, height: 24 }
    },
    '.icon-size-lg': {
        width: 32,
        height: 32,
        '> use': { width: 32, height: 32 }
    },
    '.icon-size-xl': {
        width: 64,
        height: 64,
        '> use': { width: 64, height: 64 }
    },
    '.icon-size-menu': {
        width: 23,
        height: 23,
        '> use': { width: 23, height: 23 }
    },
    '.flex-horizontal': { display: 'flex', flexDirection: 'row' },
    '.flex-vertical': { display: 'flex', flexDirection: 'column' }
}))

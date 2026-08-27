import { createGlobalStyle } from 'antd-style'

export default createGlobalStyle(({ theme }) => ({
    '*': { margin: 0, padding: 0, boxSizing: 'border-box' },
    html: { scrollBehavior: 'smooth' },
    'em, i': { fontStyle: 'normal' },
    li: { listStyle: 'none' },
    img: { border: 0, verticalAlign: 'middle' },
    button: { cursor: 'pointer' },
    a: { color: theme.colorText, textDecoration: 'none', whiteSpace: 'nowrap' },
    'button, input': {
        fontFamily:
            'Microsoft YaHei, Heiti SC, tahoma, arial, Hiragino Sans GB, "\\5B8B\\4F53", sans-serif',
        border: 0,
        outline: 'none'
    },
    body: {
        WebkitFontSmoothing: 'antialiased',
        backgroundColor: theme.colorBgLayout,
        font: '12px/1.5 Microsoft YaHei, Heiti SC, tahoma, arial, Hiragino Sans GB, "\\5B8B\\4F53", sans-serif',
        color: theme.colorText
    },
    '.hide, .none': { display: 'none' },
    '.clearfix:after': {
        visibility: 'hidden',
        clear: 'both',
        display: 'block',
        content: '"."',
        height: 0
    },
    '.clearfix': { zoom: 1 },
    '::-webkit-scrollbar': {
        width: 4
    },
    '::-webkit-scrollbar-thumb': {
        borderRadius: theme.borderRadiusLG,
        backgroundColor: theme.colorSplit
    }
}))

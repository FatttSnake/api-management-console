import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: token.paddingLG,
        backgroundColor: token.colorBgLayout
    },

    icon: {
        fill: token.colorTextSecondary,
        fontSize: token.sizeXL * 2
    },

    name: {
        color: token.colorText
    }
}))

import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    title: {
        marginBottom: token.marginMD,
        transform: `translateY(-${token.sizeSM}px)`
    },

    primary: {
        fontSize: token.fontSizeHeading3,
        fontWeight: 'bolder',
        color: token.colorPrimary
    },

    secondary: {
        fontSize: token.fontSize
    },

    form: {
        width: 300,
        fontSize: token.fontSize
    }
}))

import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: token.sizeSM,

        '> *': {
            flex: '0 0 auto'
        }
    },

    title: {
        alignItems: 'center'
    },

    name: {
        fontSize: token.fontSizeXL,
        fontWeight: 'bolder',
        color: token.colorPrimary,
        whiteSpace: 'nowrap'
    }
}))

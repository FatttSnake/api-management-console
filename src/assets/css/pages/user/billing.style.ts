import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        margin: '0 auto',
        padding: '32px 40px',
        maxWidth: 1000
    },

    account: {
        margin: token.paddingLG,
        justifyContent: 'space-between',
        fontSize: token.fontSizeHeading4,
        fontWeight: token.fontWeightStrong,

        '*': {
            flex: '0 0 auto'
        }
    }
}))

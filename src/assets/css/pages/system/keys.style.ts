import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        margin: '0 auto',
        padding: '32px 40px',
        maxWidth: 1000
    },

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

    avatarBox: {
        backgroundColor: token.colorBgContainer,
        borderRadius: '50%',
        boxShadow: token.boxShadow
    },

    avatar: {
        backgroundColor: 'transparent !important'
    },

    nickname: {
        fontSize: token.fontSizeXL,
        fontWeight: 'bolder',
        color: token.colorPrimary
    }
}))

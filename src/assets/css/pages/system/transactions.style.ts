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

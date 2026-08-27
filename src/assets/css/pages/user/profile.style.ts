import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        padding: '80px 20px 20px 20px'
    },

    qrCode: {
        width: token.sizeXXL * 6.5,
        height: token.sizeXXL * 6.5,
        backgroundColor: token.colorText,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center'
    },

    content: {
        width: '100%',
        height: '100%',
        overflow: 'visible !important',
        alignItems: 'center',
        minWidth: 900,
        paddingBottom: 20,

        '> :not(:first-child)': {
            padding: '0 60px'
        }
    },

    info: {
        marginLeft: 40,
        transform: 'translateY(-40px)',

        '> *': {
            flex: '0 0 auto'
        }
    },

    avatarBox: {
        backgroundColor: token.colorBgLayout,
        padding: 4,
        borderRadius: '50%',
        boxShadow: token.boxShadow
    },

    avatar: {
        backgroundColor: 'transparent !important'
    },

    infoName: {
        margin: '20px 0 0 20px',
        justifyContent: 'center',

        '> *': {
            flex: '0 0 auto'
        }
    },

    nickname: {
        fontSize: token.fontSizeHeading2,
        fontWeight: 'bolder',
        color: token.colorPrimary
    },

    url: {
        cursor: 'pointer',

        '> span': {
            marginLeft: 8
        }
    },

    header: {
        justifyContent: 'space-between',
        alignItems: 'center',

        '> *': {
            flex: '0 0 auto'
        }
    },

    title: {
        fontSize: token.fontSizeHeading3,
        fontWeight: 'bolder'
    },

    operation: {
        gap: 10
    },

    divider: {
        height: 1,
        width: 'calc(100% - 120px)',
        backgroundColor: token.colorSplit,
        margin: '30px 60px'
    },

    list: {
        gap: 24
    },

    row: {
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `0 ${token.paddingLG}px`,

        '> *': {
            flex: '0 0 auto'
        }
    },

    label: {
        fontSize: token.fontSizeLG,
        fontWeight: 'bolder',
        flex: 1
    },

    input: {
        width: 400,

        '> *': {
            width: '100%'
        }
    }
}))

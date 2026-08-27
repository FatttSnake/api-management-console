import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    fullscreenLoadingMask: {
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        zIndex: 100,
        backgroundColor: token.colorBgLayout
    }
}))

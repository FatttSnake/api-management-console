import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        backgroundColor: token.colorBgContainer
    },

    leftPanel: {
        backgroundColor: token.colorBgContainer
    },

    rightPanel: {
        flex: 1,
        width: 0,
        backgroundColor: token.colorBgLayout,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden'
    }
}))

import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    cardBox: {
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        boxShadow: token.boxShadowTertiary
    }
}))

import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    loadingCard: {
        padding: token.paddingLG
    },

    datasourcesContent: {
        display: 'flex',
        gap: token.paddingLG,
        flexWrap: 'wrap'
    }
}))

import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    panelHead: {
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: token.size,

        '> *': {
            flex: '0 0 auto'
        }
    },

    panelTitle: {
        alignItems: 'end',
        fontSize: token.fontSizeHeading4
    },

    panelTitleText: {
        whiteSpace: 'nowrap',
        fontWeight: 'bold'
    },

    panelTrend: {
        fontSize: token.fontSize,
        fontWeight: 'normal',
        whiteSpace: 'nowrap'
    },

    panelBody: {
        padding: token.paddingSM
    },

    chart: {
        width: '100%',
        height: 400
    }
}))

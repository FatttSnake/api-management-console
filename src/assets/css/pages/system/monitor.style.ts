import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    toolbar: {
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: token.size,

        '> *': {
            flex: '0 0 auto'
        }
    },

    toolbarTitle: {
        alignItems: 'end',
        fontSize: token.fontSizeHeading4
    },

    toolbarTitleText: {
        whiteSpace: 'nowrap',
        fontWeight: 'bold'
    },

    metric: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: token.sizeLG,

        '> *': {
            flex: '0 0 auto'
        }
    },

    metricTitle: {
        color: token.colorTextSecondary
    },

    metricValue: {
        fontSize: 28,
        fontWeight: 'bolder'
    },

    metricValueError: {
        fontSize: 28,
        fontWeight: 'bolder',
        color: token.colorError
    },

    metricDesc: {
        color: token.colorTextTertiary
    },

    panel: {
        padding: token.size
    },

    panelHead: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: token.marginSM,
        fontSize: token.fontSizeLG,

        '> *': {
            flex: '0 0 auto'
        }
    },

    panelTitle: {
        alignItems: 'center'
    },

    chart: {
        width: '100%',
        height: 360
    }
}))

import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    content: {
        fontSize: token.fontSize,
        padding: '0 10px',
        gap: 10,

        '> *': {
            gap: 5
        }
    },

    bigChart: {
        width: 0,
        height: 400
    },

    key: {
        flex: '0 0 auto',
        color: token.colorTextLabel
    },

    value: {
        color: token.colorTextDescription,
        overflow: 'hidden',

        '> *': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        }
    },

    chartValue: {
        justifyContent: 'space-between',
        width: 0
    },

    percentValue: {
        flex: '0 0 auto',
        color: token.colorTextDescription
    }
}))

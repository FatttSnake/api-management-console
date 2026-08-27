import { createStyles } from 'antd-style'

export default createStyles(() => ({
    root: {
        padding: 20,
        gap: 20,
        minWidth: 800,
        flexWrap: 'wrap',
        justifyContent: 'center',

        '> div': {
            width: '48%',
            flex: '0 0 auto'
        }
    }
}))

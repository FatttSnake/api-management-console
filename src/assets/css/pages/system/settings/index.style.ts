import { createStyles } from 'antd-style'

export default createStyles(() => ({
    root: {
        padding: 20,
        gap: 20
    },

    rootCol: {
        gap: 20,

        '> *': {
            flex: '0 0 auto'
        }
    }
}))

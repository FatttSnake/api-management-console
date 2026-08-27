import { createStyles } from 'antd-style'

export default createStyles(
    () => ({
        flexBox: {
            '> *': {
                flex: 1
            }
        }
    }),
    { hashPriority: 'low' }
)

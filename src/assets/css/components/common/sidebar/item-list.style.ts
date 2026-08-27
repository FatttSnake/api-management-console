import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        '.dnd-over-mask > li > div': {
            border: `1px dashed ${token.colorErrorHover}`,
            filter: `drop-shadow(1000px 0 0 ${token.colorErrorHover})`,
            transform: 'translate(-1000px)'
        }
    }
}))

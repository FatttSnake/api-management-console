import { PropsWithChildren } from 'react'
import useStyles from '@/assets/css/components/common/sidebar/scroll.style'
import HideScrollbar from '@/components/common/HideScrollbar'

const Scroll = (props: PropsWithChildren) => {
    const { styles } = useStyles()

    return (
        <div className={styles.root}>
            <HideScrollbar
                isShowVerticalScrollbar={true}
                scrollbarWidth={2}
                autoHideWaitingTime={800}
            >
                {props.children}
            </HideScrollbar>
        </div>
    )
}

export default Scroll

import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/common/loading-mask.style'

interface LoadingMaskProps {
    hidden?: boolean
    maskContent?: ReactNode
}

const LoadingMask = (props: PropsWithChildren<LoadingMaskProps>) => {
    const { styles, theme } = useStyles()

    const loadingIcon = (
        <Icon component={IconConsoleLoading} style={{ fontSize: 24, color: theme.colorText }} spin />
    )
    return props.hidden ? (
        props.children
    ) : (
        <div className={styles.loadingMask}>
            {props.maskContent || <AntdSpin indicator={loadingIcon} />}
        </div>
    )
}

export default LoadingMask

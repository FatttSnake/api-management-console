import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/common/fullscreen-loading-mask.style'
import FitFullscreen from '@/components/common/FitFullscreen'

const FullscreenLoadingMask = () => {
    const { styles, theme } = useStyles()

    const loadingIcon = (
        <Icon
            component={IconConsoleLoading}
            style={{ fontSize: 24, color: theme.colorText }}
            spin
        />
    )
    return (
        <FitFullscreen>
            <div className={styles.fullscreenLoadingMask}>
                <AntdSpin indicator={loadingIcon} />
            </div>
        </FitFullscreen>
    )
}

export default FullscreenLoadingMask

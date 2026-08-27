import useStyles from '@/assets/css/pages/system/statistics/index.style'
import FlexBox from '@/components/common/FlexBox'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import Permission from '@/components/common/Permission'
import OnlineInfo from '@/pages/System/Statistics/OnlineInfo'
import ActiveInfo from '@/pages/System/Statistics/ActiveInfo'
import SoftwareInfo from '@/pages/System/Statistics/SoftwareInfo'
import HardwareInfo from '@/pages/System/Statistics/HardwareInfo'
import CPUInfo from '@/pages/System/Statistics/CPUInfo'
import StorageInfo from '@/pages/System/Statistics/StorageInfo'

const Statistics = () => {
    const { styles } = useStyles()

    return (
        <FitFullscreen>
            <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                <FlexBox direction={'horizontal'} className={styles.root}>
                    <Permission operationCode={['system:statistics:query:usage']}>
                        <OnlineInfo />
                        <ActiveInfo />
                    </Permission>
                    <Permission operationCode={['system:statistics:query:base']}>
                        <HardwareInfo />
                        <SoftwareInfo />
                    </Permission>
                    <Permission operationCode={['system:statistics:query:real']}>
                        <CPUInfo />
                        <StorageInfo />
                    </Permission>
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Statistics

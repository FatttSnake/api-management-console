import useStyles from '@/assets/css/pages/system/settings/index.style'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import Base from '@/pages/System/Settings/Base'
import Mail from '@/pages/System/Settings/Mail'
import SensitiveWord from '@/pages/System/Settings/SensitiveWord'
import TwoFactor from '@/pages/System/Settings/TwoFactor'

const Settings = () => {
    const { styles } = useStyles()

    return (
        <FitFullscreen>
            <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                <FlexBox direction={'horizontal'} className={styles.root}>
                    <FlexBox className={styles.rootCol}>
                        <Permission operationCode={['system:settings:query:base']}>
                            <Base />
                        </Permission>
                        <Permission operationCode={['system:settings:query:sensitive']}>
                            <SensitiveWord />
                        </Permission>
                    </FlexBox>
                    <FlexBox className={styles.rootCol}>
                        <Permission operationCode={['system:settings:query:mail']}>
                            <Mail />
                        </Permission>
                        <Permission operationCode={['system:settings:query:two-factor']}>
                            <TwoFactor />
                        </Permission>
                    </FlexBox>
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Settings

import useStyles from '@/assets/css/pages/system/settings/index.style'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import Base from '@/pages/System/Settings/Base'
import Mail from '@/pages/System/Settings/Mail'
import SensitiveWord from '@/pages/System/Settings/SensitiveWord'
import TwoFactor from '@/pages/System/Settings/TwoFactor'
import Api from '@/pages/System/Settings/Api'

const Settings = () => {
    const { styles } = useStyles()

    return (
        <FitFullscreen>
            <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                <FlexBox direction={'horizontal'} className={styles.root}>
                    <FlexBox className={styles.rootCol}>
                        <Permission operationCode={['system:settings:base:query']}>
                            <Base />
                        </Permission>
                        <Permission operationCode={['system:settings:sensitive:query']}>
                            <SensitiveWord />
                        </Permission>
                    </FlexBox>
                    <FlexBox className={styles.rootCol}>
                        <Permission operationCode={['system:settings:mail:query']}>
                            <Mail />
                        </Permission>
                        <Permission operationCode={['system:settings:two-factor:query']}>
                            <TwoFactor />
                        </Permission>
                        <Permission operationCode={['system:settings:api:query']}>
                            <Api />
                        </Permission>
                    </FlexBox>
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Settings

import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/system/setting-card.style'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import LoadingMask from '@/components/common/LoadingMask'

interface SettingsCardProps {
    icon: IconComponent
    title: string
    loading?: boolean
    modifyOperationCode?: string[]
    expand?: ReactNode
    onReset?: () => void
    onSave?: () => void
}
export const SettingsCard = (props: PropsWithChildren<SettingsCardProps>) => {
    const { styles } = useStyles()

    return (
        <Card>
            <FlexBox className={styles.root}>
                <FlexBox direction={'horizontal'} className={styles.head}>
                    <Icon component={props.icon} className={styles.icon} />
                    <div className={styles.title}>{props.title}</div>
                    {!props.loading && (
                        <Permission operationCode={props.modifyOperationCode}>
                            {props.expand}
                            <AntdButton onClick={props.onReset} title={'重置'}>
                                <Icon component={IconConsoleReset} />
                            </AntdButton>
                            <AntdButton
                                className={styles.btSave}
                                onClick={props.onSave}
                                title={'保存'}
                            >
                                <Icon component={IconConsoleSave} />
                            </AntdButton>
                        </Permission>
                    )}
                </FlexBox>
                <LoadingMask
                    maskContent={<AntdSkeleton active paragraph={{ rows: 6 }} />}
                    hidden={!props.loading}
                >
                    {props.children}
                </LoadingMask>
            </FlexBox>
        </Card>
    )
}

export default SettingsCard

import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/system/statistics-card.style'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import LoadingMask from '@/components/common/LoadingMask'

interface StatisticsCardProps {
    icon: IconComponent
    title: ReactNode
    loading?: boolean
    expand?: ReactNode
}

export const StatisticsCard = (props: PropsWithChildren<StatisticsCardProps>) => {
    const { styles } = useStyles()

    return (
        <Card style={{ overflow: 'visible' }}>
            <FlexBox className={styles.root}>
                <FlexBox direction={'horizontal'} className={styles.head}>
                    <Icon component={props.icon} className={styles.icon} />
                    <div className={styles.title}>{props.title}</div>
                    {props.expand}
                </FlexBox>
                <LoadingMask
                    hidden={!props.loading}
                    maskContent={<AntdSkeleton active paragraph={{ rows: 6 }} />}
                >
                    {props.children}
                </LoadingMask>
            </FlexBox>
        </Card>
    )
}

export default StatisticsCard

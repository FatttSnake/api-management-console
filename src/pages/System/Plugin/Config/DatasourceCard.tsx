import useStyles from '@/assets/css/pages/system/plugin/config/datasource-card.style'
import Card from '@/components/common/Card'

interface DatasourceCardProps {
    dbType: 'MYSQL' | 'SQLITE'
    name: string
    configured: boolean
    required: boolean
}

const DatasourceCard = ({ dbType, name, configured, required }: DatasourceCardProps) => {
    const { styles, theme } = useStyles()

    return (
        <AntdBadge.Ribbon
            color={
                configured
                    ? theme.colorSuccess
                    : required
                      ? theme.colorWarning
                      : theme.colorBgElevated
            }
            styles={{ content: { fontSize: theme.fontSizeSM } }}
            text={configured ? '已配置' : required ? '未配置' : '可选'}
        >
            <Card className={styles.root}>
                <span className={styles.icon}>
                    {dbType === 'MYSQL' ? <IconConsoleMysql /> : <IconConsoleSqlite />}
                </span>
                <span className={styles.name}>{name}</span>
            </Card>
        </AntdBadge.Ribbon>
    )
}

export default DatasourceCard

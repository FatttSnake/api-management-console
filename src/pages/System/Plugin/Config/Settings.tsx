import useStyles from '@/assets/css/pages/system/plugin/config/settings.style'
import { message } from '@/utils/common'
import { r_sys_api_plugin_config_get } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import SettingsCard from '@/components/system/SettingCard'
import DatasourceCard from '@/pages/System/Plugin/Config/DatasourceCard'
import ConfigCard from '@/pages/System/Plugin/Config/ConfigCard'

interface SettingsProps {
    pluginId: string
}

const Settings = ({ pluginId }: SettingsProps) => {
    const { styles } = useStyles()
    const [configData, setConfigData] = useState<ApiPluginConfigVo>()
    const [isLoading, setIsLoading] = useState(false)
    const [modifiedGroup, setModifiedGroup] = useState<string>()

    const handleOnGroupEdited = (groupKey: string) => {
        return () => {
            setModifiedGroup(groupKey)
        }
    }

    // A group names the datasource the gateway says it describes; the declaration itself is
    // what says which config keys that one is composed from
    const datasourceOf = (
        group: ApiPluginConfigGroupVo,
        datasources: ApiPluginConfigDatasourceVo[]
    ) => datasources.find((datasource) => datasource.name === group.datasource)

    const getConfig = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_plugin_config_get(pluginId)
            .then((res) => {
                const response = res.data
                if (response.success) {
                    setModifiedGroup(undefined)
                    setConfigData(response.data!)
                } else {
                    void message.error('获取配置失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        setConfigData(undefined)
        getConfig()
    }, [pluginId])

    const renderDatasources = (datasources: ApiPluginConfigDatasourceVo[]) => (
        <Card>
            <SettingsCard icon={IconConsoleDatasource} title={'数据源'} hideResetBtn hideSaveBtn>
                <div className={styles.datasourcesContent}>
                    {datasources.map(({ dbType, name, configured, required }) => (
                        <DatasourceCard
                            dbType={dbType}
                            name={name}
                            configured={configured}
                            required={required}
                        />
                    ))}
                </div>
            </SettingsCard>
        </Card>
    )

    return (
        <FlexBox gap={10}>
            {configData ? (
                <>
                    {!configData.datasources.length && !configData.groups.length && (
                        <Card>
                            <AntdResult
                                status={'info'}
                                title={'该插件未声明配置项'}
                                subTitle={'插件未附带 plugin-config.json，或未声明任何分组'}
                            />
                        </Card>
                    )}
                    {!!configData.datasources.length && renderDatasources(configData.datasources)}
                    {!!configData.groups.length &&
                        configData.groups.map((group) => (
                            <ConfigCard
                                pluginId={pluginId}
                                group={group}
                                datasource={datasourceOf(group, configData.datasources)}
                                disabled={!!modifiedGroup && modifiedGroup !== group.key}
                                onEdited={handleOnGroupEdited(group.key)}
                                onSaved={getConfig}
                                onReset={getConfig}
                            />
                        ))}
                </>
            ) : (
                <Card className={styles.loadingCard}>
                    <AntdSkeleton />
                </Card>
            )}
        </FlexBox>
    )
}

export default Settings

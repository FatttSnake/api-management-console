import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/pages/system/plugin/config/index.style'
import {
    API_PLATFORM_PLUGIN_INSTALL_FAILED,
    DATABASE_NO_RECORD_FOUND,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS,
    PERMISSION_ACCESS_DENIED
} from '@/constants/common.constants'
import { message } from '@/utils/common'
import { navigateToPluginManagement } from '@/utils/navigation'
import { r_sys_api_plugin_info_get, r_sys_api_plugin_reload } from '@/services/system'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import Permission from '@/components/common/Permission'
import Settings from '@/pages/System/Plugin/Config/Settings'

const Config = () => {
    const navigate = useNavigate()
    const { pluginId } = useParams()
    const { styles, theme } = useStyles()
    const [pluginData, setPluginData] = useState<ApiPluginVo>()
    const [isReloading, setIsReloading] = useState(false)

    const handleOnReload = () => {
        if (isReloading) {
            return
        }
        setIsReloading(true)

        r_sys_api_plugin_reload(pluginId!)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_UPDATE_SUCCESS:
                        void message.success('重新挂载成功')
                        setPluginData(response.data ?? pluginData)
                        break
                    case API_PLATFORM_PLUGIN_INSTALL_FAILED:
                        void message.error(`重新挂载失败：${response.msg}`)
                        break
                    default:
                        void message.error('重新挂载失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsReloading(false)
            })
    }

    const getPluginInfo = () => {
        r_sys_api_plugin_info_get(pluginId!).then((res) => {
            const response = res.data
            switch (response.code) {
                case DATABASE_SELECT_SUCCESS:
                    setPluginData(response.data!)
                    break
                case DATABASE_NO_RECORD_FOUND:
                    message.warning('插件不存在').then(() => {
                        navigateToPluginManagement(navigate)
                    })
                    break
                case PERMISSION_ACCESS_DENIED:
                    message.error('暂无权限').then(() => {
                        navigateToPluginManagement(navigate)
                    })
                    break
                default:
                    void message.error('获取插件信息失败，请稍后重试')
            }
        })
    }

    useEffect(() => {
        getPluginInfo()
    }, [pluginId])

    const toolbar = (
        <Card>
            <FlexBox className={styles.toolbar} direction={'horizontal'}>
                <FlexBox className={styles.title} direction={'horizontal'} gap={4}>
                    <AntdButton
                        color={'default'}
                        variant={'link'}
                        size={'small'}
                        icon={<Icon component={IconConsoleBack} />}
                        onClick={() => {
                            navigateToPluginManagement(navigate)
                        }}
                    />
                    <FlexBox direction={'horizontal'} gap={4}>
                        <div className={styles.name}>{pluginData?.name ?? pluginId}</div>
                        {pluginData && (
                            <div>
                                {pluginData.enable ? (
                                    pluginData.loadError ? (
                                        <AntdTag color={'error'} title={pluginData.loadError}>
                                            挂载失败
                                        </AntdTag>
                                    ) : (
                                        <AntdTag color={'success'}>启用</AntdTag>
                                    )
                                ) : (
                                    <AntdTag>禁用</AntdTag>
                                )}
                            </div>
                        )}
                    </FlexBox>
                </FlexBox>
                <AntdSpace>
                    <Permission operationCode={['system:plugin:plugin:reload']}>
                        <AntdButton
                            size={'small'}
                            loading={isReloading}
                            disabled={!pluginData}
                            onClick={handleOnReload}
                        >
                            重新挂载
                        </AntdButton>
                    </Permission>
                </AntdSpace>
            </FlexBox>
        </Card>
    )

    return (
        <FitFullscreen>
            <HideScrollbar
                style={{ padding: 20 }}
                isShowVerticalScrollbar
                autoHideWaitingTime={1000}
            >
                <FlexBox gap={20}>
                    {toolbar}
                    {pluginData ? (
                        <Settings pluginId={pluginId!} />
                    ) : (
                        <Card style={{ padding: theme.paddingLG }}>
                            <AntdSkeleton />
                        </Card>
                    )}
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Config

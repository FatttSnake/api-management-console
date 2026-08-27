import useStyles from '@/assets/css/pages/system/statistics/common.style'
import { message } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import { r_sys_statistics_software } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import StatisticsCard from '@/components/system/StatisticsCard'

const SoftwareInfo = () => {
    const { styles } = useStyles()
    const [softwareInfoData, setSoftwareInfoData] = useState<SoftwareInfoVo>()

    useEffect(() => {
        r_sys_statistics_software().then((res) => {
            const response = res.data
            if (response.success) {
                response.data && setSoftwareInfoData(response.data)
            } else {
                void message.error('获取软件信息失败，请稍后重试')
            }
        })
    }, [])

    return (
        <StatisticsCard
            icon={IconConsoleSoftware}
            title={'软件信息'}
            loading={softwareInfoData === undefined}
        >
            <FlexBox className={styles.content} direction={'horizontal'}>
                <FlexBox className={styles.key}>
                    <div>前端界面</div>
                    <div>后端服务</div>
                    <div>操作系统</div>
                    <div>Java</div>
                    <div>Java 供应商</div>
                    <div>JVM</div>
                    <div>JVM 供应商</div>
                    <div>操作系统启动时间</div>
                    <div>后端服务启动时间</div>
                </FlexBox>
                <FlexBox className={styles.value}>
                    <div title={__APP_VERSION__}>{__APP_VERSION__}</div>
                    <div title={softwareInfoData?.serviceVersion}>
                        {softwareInfoData?.serviceVersion}
                    </div>
                    <div title={`${softwareInfoData?.os} (${softwareInfoData?.bitness}位)`}>
                        {`${softwareInfoData?.os} (${softwareInfoData?.bitness}位)`}
                    </div>
                    <div
                        title={`${softwareInfoData?.javaVersion} (${softwareInfoData?.javaVersionDate})`}
                    >{`${softwareInfoData?.javaVersion} (${softwareInfoData?.javaVersionDate})`}</div>
                    <div title={softwareInfoData?.javaVendor}>{softwareInfoData?.javaVendor}</div>
                    <div
                        title={`${softwareInfoData?.jvm} (build ${softwareInfoData?.jvmVersion}, ${softwareInfoData?.jvmInfo})`}
                    >{`${softwareInfoData?.jvm} (build ${softwareInfoData?.jvmVersion}, ${softwareInfoData?.jvmInfo})`}</div>
                    <div title={softwareInfoData?.jvmVendor}>{softwareInfoData?.jvmVendor}</div>
                    <div>
                        {softwareInfoData?.osBootTime &&
                            utcToLocalTime(softwareInfoData?.osBootTime)}
                    </div>
                    <div>
                        {softwareInfoData?.serverStartupTime &&
                            utcToLocalTime(softwareInfoData.serverStartupTime)}
                    </div>
                </FlexBox>
            </FlexBox>
        </StatisticsCard>
    )
}

export default SoftwareInfo

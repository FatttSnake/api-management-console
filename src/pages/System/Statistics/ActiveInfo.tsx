import Icon from '@ant-design/icons'
import * as echarts from 'echarts/core'
import useStyles from '@/assets/css/pages/system/statistics/common.style'
import { getTimesBetweenTwoTimes } from '@/utils/datetime'
import { r_sys_statistics_active } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import { getTooltipTimeFormatter, lineEChartsBaseOption } from '@/pages/System/Statistics/shared'
import StatisticsCard from '@/components/system/StatisticsCard'

const ActiveInfo = () => {
    const { styles } = useStyles()
    const activeInfoDivRef = useRef<HTMLDivElement>(null)
    const activeInfoEChartsRef = useRef<echarts.EChartsType | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [scope, setScope] = useState('WEEK')

    useEffect(() => {
        const chartResizeObserver = new ResizeObserver(() => {
            activeInfoEChartsRef.current?.resize()
        })

        activeInfoDivRef.current && chartResizeObserver.observe(activeInfoDivRef.current)

        return () => {
            activeInfoDivRef.current && chartResizeObserver.unobserve(activeInfoDivRef.current)
        }
    }, [isLoading])

    useEffect(() => {
        getActiveInfo()
    }, [])

    const handleOnScopeChange = (value: string) => {
        setScope(value)
        getActiveInfo(value)
    }

    const handleOnRefresh = () => {
        getActiveInfo()
    }

    const getActiveInfo = (_scope: string = scope) => {
        if (isLoading) {
            return
        }

        setIsLoading(true)

        r_sys_statistics_active({ scope: _scope }).then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                if (data) {
                    setIsLoading(false)

                    setTimeout(() => {
                        const registerList = data.registerHistory.length
                            ? getTimesBetweenTwoTimes(
                                  data.registerHistory[0].time,
                                  data.registerHistory[data.registerHistory.length - 1].time,
                                  'day'
                              ).map((time) => [
                                  time,
                                  data.registerHistory.find(
                                      (value) =>
                                          value.time.substring(0, 10) === time.substring(0, 10)
                                  )?.count ?? 0
                              ])
                            : []
                        const loginList = data.loginHistory.length
                            ? getTimesBetweenTwoTimes(
                                  data.loginHistory[0].time,
                                  data.loginHistory[data.loginHistory.length - 1].time,
                                  'day'
                              ).map((time) => [
                                  time,
                                  data.loginHistory.find(
                                      (value) =>
                                          value.time.substring(0, 10) === time.substring(0, 10)
                                  )?.count ?? 0
                              ])
                            : []
                        const verifyList = data.verifyHistory.length
                            ? getTimesBetweenTwoTimes(
                                  data.verifyHistory[0].time,
                                  data.verifyHistory[data.verifyHistory.length - 1].time,
                                  'day'
                              ).map((time) => [
                                  time,
                                  data.verifyHistory.find(
                                      (value) =>
                                          value.time.substring(0, 10) === time.substring(0, 10)
                                  )?.count ?? 0
                              ])
                            : []

                        activeInfoEChartsRef.current = echarts.init(
                            activeInfoDivRef.current,
                            null,
                            { renderer: 'svg' }
                        )

                        activeInfoEChartsRef.current?.setOption({
                            ...lineEChartsBaseOption,
                            useUTC: true,
                            tooltip: {
                                ...lineEChartsBaseOption.tooltip,
                                formatter: getTooltipTimeFormatter('YYYY-MM-DD')
                            },
                            dataZoom: [
                                {
                                    type: 'inside',
                                    start: 0,
                                    end: 100,
                                    minValueSpan: 2 * 24 * 60 * 60 * 1000
                                }
                            ],
                            series: [
                                {
                                    name: '注册人数',
                                    type: 'line',
                                    smooth: true,
                                    symbol: 'none',
                                    areaStyle: {},
                                    data: registerList
                                },
                                {
                                    name: '登录人数',
                                    type: 'line',
                                    smooth: true,
                                    symbol: 'none',
                                    areaStyle: {},
                                    data: loginList
                                },
                                {
                                    name: '验证账号人数',
                                    type: 'line',
                                    smooth: true,
                                    symbol: 'none',
                                    areaStyle: {},
                                    data: verifyList
                                }
                            ]
                        })
                    })
                }
            }
        })
    }

    return (
        <StatisticsCard
            icon={IconConsoleAnalysis}
            title={
                <FlexBox gap={10} direction={'horizontal'}>
                    <span style={{ whiteSpace: 'nowrap' }}>用户活跃</span>
                </FlexBox>
            }
            loading={isLoading}
            expand={
                <>
                    <AntdSelect
                        value={scope}
                        onChange={handleOnScopeChange}
                        disabled={isLoading}
                        style={{ width: '8em' }}
                    >
                        <AntdSelect.Option key={'WEEK'}>最近7天</AntdSelect.Option>
                        <AntdSelect.Option key={'MONTH'}>最近30天</AntdSelect.Option>
                        <AntdSelect.Option key={'QUARTER'}>最近3月</AntdSelect.Option>
                        <AntdSelect.Option key={'YEAR'}>最近12月</AntdSelect.Option>
                        <AntdSelect.Option key={'TWO_YEARS'}>最近2年</AntdSelect.Option>
                        <AntdSelect.Option key={'THREE_YEARS'}>最近3年</AntdSelect.Option>
                        <AntdSelect.Option key={'FIVE_YEARS'}>最近5年</AntdSelect.Option>
                        <AntdSelect.Option key={'ALL'}>全部</AntdSelect.Option>
                    </AntdSelect>
                    <AntdButton title={'刷新'} onClick={handleOnRefresh} disabled={isLoading}>
                        <Icon component={IconConsoleRefresh} />
                    </AntdButton>
                </>
            }
        >
            <FlexBox className={styles.content} direction={'horizontal'}>
                <div className={styles.bigChart} ref={activeInfoDivRef} />
            </FlexBox>
        </StatisticsCard>
    )
}

export default ActiveInfo

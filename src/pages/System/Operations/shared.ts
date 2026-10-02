import * as echarts from 'echarts/core'
import { BarChart, BarSeriesOption, LineChart, LineSeriesOption } from 'echarts/charts'
import {
    GridComponent,
    GridComponentOption,
    LegendComponent,
    LegendComponentOption,
    TooltipComponent,
    TooltipComponentOption
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features'
import { CallbackDataParams } from 'echarts/types/dist/shared'

echarts.use([
    TooltipComponent,
    GridComponent,
    LegendComponent,
    BarChart,
    LineChart,
    SVGRenderer,
    UniversalTransition
])

export type EChartsOption = echarts.ComposeOption<
    | TooltipComponentOption
    | GridComponentOption
    | LegendComponentOption
    | BarSeriesOption
    | LineSeriesOption
>

export const trendLineOption = (
    categories: string[],
    values: number[],
    seriesName: string,
    digit: number
): EChartsOption => {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            },
            formatter: (params) => {
                const list = params as CallbackDataParams[]
                if (!list.length) {
                    return ''
                }

                const dataIndex = list[0].dataIndex
                return [
                    ...list.map(
                        (item) =>
                            `${item.marker}${item.seriesName}: ${Number(item.value).toFixed(digit)}`
                    ),
                    `较前日: ${formatDayOverDay(
                        calcDayOverDay(values[dataIndex], values[dataIndex - 1]),
                        digit
                    )}`
                ].join('<br/>')
            }
        },
        grid: {
            left: 8,
            right: 16,
            top: 32,
            bottom: 8,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: categories
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: seriesName,
                type: 'line',
                data: values,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    width: 2
                },
                areaStyle: {
                    opacity: 0.1
                }
            }
        ]
    }
}

export interface DayOverDay {
    diff: number | null
    ratio: number | null
}

export const calcDayOverDay = (current: number, previous?: number): DayOverDay => {
    if (previous === undefined) {
        return { diff: null, ratio: null }
    }

    const diff = current - previous
    const ratio = diff / previous
    return { diff, ratio: Number.isNaN(ratio) ? 0 : ratio }
}

export const formatDiff = (diff: number | null, digit: number): string =>
    diff === null ? '-' : `${diff > 0 ? '+' : ''}${diff.toFixed(digit)}`

export const formatRatio = (ratio: number | null): string => {
    if (ratio === null) {
        return '-'
    }
    if (!Number.isFinite(ratio)) {
        return ratio > 0 ? '+∞' : '-∞'
    }
    return `${ratio > 0 ? '+' : ''}${(ratio * 100).toFixed(2)}%`
}

export const formatDayOverDay = (dayOverDay: DayOverDay, digit: number): string => {
    if (dayOverDay.diff === null) {
        return '-'
    }
    return `${formatDiff(dayOverDay.diff, digit)} (${formatRatio(dayOverDay.ratio)})`
}

export const topBarOption = (list: ApiTopVo[]): EChartsOption => {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: 8,
            right: 32,
            top: 8,
            bottom: 8,
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: list.map((item) =>
                !!item.pluginVo && !!item.interfaceVo
                    ? `${item.pluginVo.name}:${item.interfaceVo.name}`
                    : item.apiCode
            ),
            inverse: true
        },
        series: [
            {
                name: '调用次数',
                type: 'bar',
                data: list.map((item) => item.count),
                barMaxWidth: 18,
                itemStyle: {
                    borderRadius: [0, 4, 4, 0]
                },
                label: {
                    show: true,
                    position: 'right'
                }
            }
        ]
    }
}

import * as echarts from 'echarts/core'
import {
    DataZoomComponent,
    DataZoomComponentOption,
    GridComponent,
    GridComponentOption,
    LegendComponent,
    LegendComponentOption,
    ToolboxComponent,
    ToolboxComponentOption,
    TooltipComponent,
    TooltipComponentOption
} from 'echarts/components'
import { BarChart, BarSeriesOption, LineChart, LineSeriesOption } from 'echarts/charts'
import { SVGRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features'
import { CallbackDataParams } from 'echarts/types/dist/shared'
import { utcToLocalTime } from '@/utils/datetime'

echarts.use([
    TooltipComponent,
    ToolboxComponent,
    GridComponent,
    LegendComponent,
    DataZoomComponent,
    BarChart,
    LineChart,
    SVGRenderer,
    UniversalTransition
])

export type EChartsOption = echarts.ComposeOption<
    | TooltipComponentOption
    | ToolboxComponentOption
    | GridComponentOption
    | LegendComponentOption
    | BarSeriesOption
    | DataZoomComponentOption
    | LineSeriesOption
>

export const barDefaultSeriesOption: BarSeriesOption = {
    type: 'bar',
    stack: 'total',
    itemStyle: {
        color: (params) => {
            switch (params.seriesName) {
                case 'idle':
                case 'free':
                    return '#F5F5F5'
                default:
                    return params.color ?? echarts.color.random()
            }
        }
    }
}

export const barEChartsBaseOption: EChartsOption = {
    tooltip: {},
    xAxis: {
        show: false
    },
    yAxis: {
        axisLine: {
            show: false
        },
        axisLabel: {
            show: false
        },
        axisTick: {
            show: false
        },
        splitLine: {
            show: false
        },
        axisPointer: {
            show: false
        }
    }
}

export const getTooltipTimeFormatter = (format: string = 'YYYY-MM-DD HH:mm:ss') => {
    return (params: CallbackDataParams[]) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        `${utcToLocalTime(params[0].data[0], format)}<br>${params
            .map(
                (param) =>
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    `<span style="display: flex; justify-content: space-between;"><span>${param.marker}${param.seriesName}</span><span style="font-weight: bold; margin-left: 16px;">${param.data[1]}</span></span>`
            )
            .join('')}`
}

export const lineEChartsBaseOption: EChartsOption = {
    tooltip: {
        trigger: 'axis'
    },
    legend: {},
    toolbox: {
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'time'
    },
    yAxis: {
        type: 'value',
        interval: 1
    },
    dataZoom: [
        {
            type: 'inside',
            start: 0,
            end: 100,
            minValueSpan: 2 * 60 * 60 * 1000
        }
    ],
    series: [{}]
}

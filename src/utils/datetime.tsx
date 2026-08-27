import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const getNowLocalTime = (format: string = 'YYYY-MM-DD HH:mm:ssZ') => {
    return dayjs().local().format(format)
}

export const getNowUtc = () => {
    return dayjs().toISOString()
}

export const utcToLocalTime = (utcTime: string, format: string = 'YYYY-MM-DD HH:mm:ssZ') => {
    return dayjs.utc(utcTime).local().format(format)
}

export const dayjsToLocalTime = (date: dayjs.Dayjs, format: string = 'YYYY-MM-DD HH:mm:ssZ') => {
    return date.format(format)
}

export const dayjsToUtc = (date: dayjs.Dayjs) => {
    return date.toISOString()
}

export const localTimeToUtc = (localTime: string) => {
    return dayjs(localTime).toISOString()
}

export const isPastTime = (utcTime: string) => {
    return dayjs.utc(utcTime).isBefore(dayjs())
}

export const utcToMillisecond = (utcTime: string) => {
    return dayjs.utc(utcTime).valueOf()
}

export const millisecondToUtc = (millisecond: number) => {
    return dayjs(millisecond).toISOString()
}

export const getTimesBetweenTwoTimes = (
    startTime: string,
    endTime: string,
    interval: dayjs.ManipulateType
) => {
    const timesList: string[] = []
    const start = dayjs.utc(startTime)
    const end = dayjs.utc(endTime)
    let current = start

    const count = end.diff(start, interval)
    timesList.push(start.toISOString())

    for (let i = 0; i < count; i++) {
        current = current.add(1, interval)
        timesList.push(current.toISOString())
    }

    return timesList
}

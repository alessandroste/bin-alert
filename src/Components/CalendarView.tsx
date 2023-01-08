import { IconX } from "@tabler/icons"
import { useMemo, useState } from "react"
import './CalendarView.css'

export interface IDayCell {
    date: Date
    text: string[]
    tooltip?: string[]
}

export interface ICalendarViewOptions {
    entries?: IDayCell[]
}

export function CalendarView(options: ICalendarViewOptions): JSX.Element {
    const dayInMilliseconds = 1000 * 60 * 60 * 24
    const formatDate = (date: Date) => date.toLocaleDateString(undefined, { day: '2-digit' })
    const formatDateShort = (date: Date) => date.toLocaleDateString(undefined, { weekday: 'short' })
    const formatDateMonthYear = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })

    const [today] = useState(() => {
        const date = new Date()
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    })

    const [yearMonth, setYearMonth] = useState(() => new Date(today.getFullYear(), today.getMonth()))

    const days = useMemo(() => {
        const firstWeekDayOfMonth = yearMonth.getDay()
        const days = new Array<Date>(42)
        for (let i = 0; i < firstWeekDayOfMonth; i++) {
            days[i] = new Date(yearMonth.getTime() - (firstWeekDayOfMonth - i) * dayInMilliseconds)
        }
        days[firstWeekDayOfMonth] = new Date(yearMonth.getTime())
        for (let i = 0; i < 42 - firstWeekDayOfMonth; i++) {
            days[firstWeekDayOfMonth + i] = new Date(yearMonth.getTime() + dayInMilliseconds * i)
        }
        return days;
    }, [yearMonth])

    const getCalendar = useMemo((): JSX.Element[] => {
        return Array.apply(null, new Array(6))
            .map((_, i) => days.slice(i * 7, (i + 1) * 7))
            .filter((w, i, a) => w.some(d =>
                d.getFullYear() === yearMonth.getFullYear() &&
                d.getMonth() === yearMonth.getMonth()))
            .map((week, i) => {
                return (
                    <tr
                        key={i}>
                        {week.map(d => {
                            const isMonth = d.getFullYear() === yearMonth.getFullYear() && d.getMonth() === yearMonth.getMonth()
                            const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
                            const cellClassName = 'h-24 p-2 md:p-4 relative align-top border-t' + (isMonth ? '' : ' bg-base-200') + (isToday ? '  text-primary-content' : '')
                            const dayIndicatorClassName = 'rounded p-2' + (isToday ? ' bg-primary' : '')
                            const cellEntry = options.entries?.find(e => e.date.getTime() === d.getTime())
                            return (
                                <td
                                    key={d.getTime()}
                                    className={cellClassName}>
                                    <span className={dayIndicatorClassName}>
                                        {formatDate(d)}
                                    </span>
                                    {cellEntry ? (
                                        <label
                                            htmlFor={'modal-calendar-' + d.getTime()}
                                            className='absolute top-0 left-0 bottom-0 right-0 cursor-pointer'>
                                        </label>)
                                        : undefined}
                                    {cellEntry ? (
                                        <label

                                            htmlFor={'modal-calendar-' + d.getTime()}
                                            className='absolute bottom-0 right-0 p-4 cursor-pointer'>
                                            <span
                                                className='tooltip'
                                                data-tip={cellEntry?.tooltip?.join('\n')}>
                                                {cellEntry?.text?.join('')}
                                            </span>
                                        </label>) : undefined}
                                    {cellEntry ? (
                                        <input type='checkbox' id={'modal-calendar-' + d.getTime()} className='modal-toggle' />) : undefined}
                                    {cellEntry ? (<div className='modal modal-bottom sm:modal-middle text-base-content'>
                                        <div className='modal-box relative'>
                                            <label htmlFor={'modal-calendar-' + d.getTime()} className='btn btn-sm btn-circle btn-secondary absolute right-2 top-2'>
                                                <IconX />
                                            </label>
                                            <h3 className='font-bold text-lg'>{d.toDateString()}</h3>
                                            <ul className='py-4 whitespace-normal'>
                                                {cellEntry?.tooltip?.map((e, i) => (<li key={i}>{e}</li>))}
                                            </ul>
                                        </div>
                                    </div>) : undefined}
                                </td>)
                        })}
                    </tr>)
            })
    }, [days, yearMonth, options.entries])

    const getHeader = useMemo((): JSX.Element[] => {
        return days.slice(0, 7)
            .map((_, i) => {
                return (
                    <th
                        key={i}
                        className='rounded-none'>
                        {formatDateShort(days[i])}
                    </th>)
            })
    }, [days])

    const onPaginationClick = (direction: 'prev' | 'next') => {
        setYearMonth(ex => {
            const m = new Date(ex)
            if (direction === 'next')
                if (m.getMonth() === 11) {
                    m.setFullYear(m.getFullYear() + 1)
                    m.setMonth(0)
                } else {
                    m.setMonth(m.getMonth() + 1)
                }
            else if (direction === 'prev')
                if (m.getMonth() === 0) {
                    m.setFullYear(m.getFullYear() - 1)
                    m.setMonth(11)
                } else {
                    m.setMonth(m.getMonth() - 1)
                }
            return m
        })
    }

    const onYearPaginationClick = (direction: 'prev' | 'next') => {
        setYearMonth(ex => {
            const m = new Date(ex)
            if (direction === 'next')
                m.setFullYear(m.getFullYear() + 1)
            else if (direction === 'prev')
                m.setFullYear(m.getFullYear() - 1)
            return m
        })
    }

    const dateMonthYear = useMemo(() => formatDateMonthYear(yearMonth), [yearMonth])

    return (
        <div className=''>
            <div className='flex justify-center w-full py-5 '>
                <div className='btn-group'>
                    <button
                        className='btn btn-primary'
                        onClick={() => onYearPaginationClick('prev')}>
                        《
                    </button>
                    <button
                        className='btn btn-primary'
                        onClick={() => onPaginationClick('prev')}>
                        〈
                    </button>
                    <button
                        className='btn btn-primary'
                        onClick={() => setYearMonth(new Date(today.getFullYear(), today.getMonth()))}>
                        {dateMonthYear}
                    </button>
                    <button
                        className='btn btn-primary'
                        onClick={() => onPaginationClick('next')}>
                        〉
                    </button>
                    <button
                        className='btn btn-primary'
                        onClick={() => onYearPaginationClick('next')}>
                        》
                    </button>
                </div>
            </div>
            <table className='table w-full'>
                <thead>
                    <tr>
                        {getHeader}
                    </tr>
                </thead>
                <tbody>
                    {getCalendar}
                </tbody>
            </table>
        </div>
    )
}
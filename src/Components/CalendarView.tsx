export interface ICalendarViewOptions {

}

export function CalendarView(options: ICalendarViewOptions): JSX.Element {
    const dayInMilliseconds = 1000 * 60 * 60 * 24
    const now = new Date()
    const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

    const formatDate = (date: Date) => date.toLocaleDateString(undefined, { day: '2-digit' })
    const formatDateShort = (date: Date) => date.toLocaleDateString(undefined, { weekday: 'short' })

    const buildDaysOfMonth = function (monthDate: Date): Date[] {
        const firstDayOfMonth = new Date(monthDate.getUTCFullYear(), monthDate.getUTCMonth())
        const firstWeekDayOfMonth = firstDayOfMonth.getDay()
        const days = Array.apply(null, Array(42)).map(() => new Date())

        for (let i = 0; i < firstWeekDayOfMonth; i++) {
            days[i].setTime(firstDayOfMonth.getTime() - (firstWeekDayOfMonth - i) * dayInMilliseconds)
        }

        days[firstWeekDayOfMonth].setTime(firstDayOfMonth.getTime())

        for (let i = 0; i < 42 - firstWeekDayOfMonth; i++) {
            days[firstWeekDayOfMonth + i].setTime(firstDayOfMonth.getTime() + dayInMilliseconds * i)
        }

        return days;
    }

    const buildCalendar = function (days: Date[]): JSX.Element[] {
        return Array.apply(null, Array(6)).map((v, i) => (<tr className='h-24'>{days.slice(i * 7, (i + 1) * 7).map(d => {
            const isMonth = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
            return (<td className={!isMonth ? 'bg-base-300' : ''}>{formatDate(d)}</td>)
        })}</tr>))
    }

    const buildHeader = function (days: Date[]): JSX.Element[] {
        return Array.apply(null, Array(7)).map((v, i) => {
            let day = formatDateShort(days[i])
            return (<th key={day} className=''>{day}</th>)
        })
    }

    let days = buildDaysOfMonth(today)

    return (
        <table className='table w-full'>
            <thead>
                <tr>{buildHeader(days)}</tr>
            </thead>
            <tbody>{buildCalendar(days)}</tbody>
        </table>)
}
import ical, { ICalAlarmType } from 'ical-generator'
import { CategoryId, IDataProvider, IDataset, IDatasetCategory, IDatasetEvent, Material, Region } from './Model'
import { StaticDataProvider } from './StaticDataProvider'

export interface IDatasetFilter {
    materials?: Material[]
    regions?: Region[]
    areas?: string[]
    subAreas?: string[]
    startDate?: Date
    endDate?: Date
}

export interface ITimeDelta {
    days?: number
    hours?: number
    minutes?: number
}

export interface ICalendarOptions {
    reminders?: ITimeDelta[]
    eventTimeShift?: ITimeDelta
    eventDuration?: ITimeDelta
}

export class Calendar {
    private dataSet: Promise<IDataset>

    constructor(provider?: IDataProvider) {
        this.dataSet = (provider ?? new StaticDataProvider()).dataset
    }

    public async getDates(categoryFilter?: IDatasetFilter): Promise<IDatasetEvent[]> {
        const categoryIndices = Array.from((await this.dataSet).categories.entries()).filter(([, cat]) =>
            (categoryFilter?.areas === undefined || categoryFilter.areas.some(a => a === cat.area)) &&
            (categoryFilter?.materials === undefined || categoryFilter.materials.some(m => m == cat.material)))
            .map(([cat]) => cat)
        const dates = Array.from((await this.dataSet).events)
            .filter(value => categoryIndices.includes(value.category))
            .filter(({ date }) => {
                if (categoryFilter?.startDate && date.getTime() < categoryFilter?.startDate.getTime())
                    return false
                if (categoryFilter?.endDate && date.getTime() > categoryFilter?.endDate.getTime())
                    return false
                return true
            })
        return dates
    }

    public getCategories = async (): Promise<Map<CategoryId, IDatasetCategory>> => (await this.dataSet).categories

    public async createICalendar(categoryFilter?: IDatasetFilter, options?: ICalendarOptions): Promise<string> {
        let dates = await this.getDates(categoryFilter)
        let categories = await this.getCategories()

        let calendar = ical({
            name: 'bin-alert',
            prodId: {
                company: 'bin',
                product: 'alert'
            }
        })
        dates.forEach(d => {
            let category = categories.get(d.category)
            let eventStartTime = options?.eventTimeShift ? this.getShiftedTime(d.date, options.eventTimeShift) : d.date
            let eventEndTime = this.getShiftedTime(eventStartTime, options?.eventDuration ? options.eventDuration : { minutes: 15 })

            let event = calendar.createEvent({
                start: eventStartTime,
                end: eventEndTime,
                summary: 'Waste collection',
                description: `Reminder for waste collection of ${category?.material} in the area ${category?.area}. Collection day is ${d.date.toDateString()}`,
            })

            let reminderDates = (options?.reminders ?? []).map(r => this.getShiftedTime(d.date, r))
            reminderDates.forEach(r => {
                event.createAlarm({
                    type: ICalAlarmType.display,
                    trigger: r
                })
            })
        })

        return calendar.toString()
    }

    private getShiftedTime(originalTime: Date, timeShift: ITimeDelta): Date {
        let daysShiftInMs = (timeShift.days ?? 0) * 24 * 60 * 60 * 1000
        let hoursShiftInMs = (timeShift.hours ?? 0) * 60 * 60 * 1000
        let minutesShiftInMs = (timeShift.minutes ?? 0) * 60 * 1000
        let shiftedDate = new Date(originalTime)
        shiftedDate.setTime(shiftedDate.getTime() + daysShiftInMs + hoursShiftInMs + minutesShiftInMs)
        return shiftedDate
    }
}
import ical, { ICalAlarmType } from 'ical-generator'

export enum Region {
    ZH
}

export enum Material {
    PAPER = 'PAPER',
    CARDBOARD = 'CARDBOARD'
}

// Reading the metadata of the dataset
export interface IDatasetEntry {
    file: string
    year: number
    type: keyof typeof Material
}

export type Category = number

export interface IDatasetEvent {
    category: Category
    date: Date
}

export interface IDatasetCategory {
    category?: Category
    material: Material
    region: Region
    area?: string
    subArea?: string
}

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
    private categories = new Array<IDatasetCategory>()
    private data = new Array<IDatasetEvent>()
    private load: Promise<void>

    constructor() {
        this.load = this.loadData()
    }

    public async getDates(categoryFilter?: IDatasetFilter): Promise<IDatasetEvent[]> {
        await this.load
        let categoryIndices = this.categories.filter(cat =>
            (categoryFilter?.areas === undefined || categoryFilter.areas.some(a => a === cat.area)) &&
            (categoryFilter?.materials === undefined || categoryFilter.materials.some(m => m == cat.material)))
            .map(cat => cat.category)
        let dates = this.data.filter(value => categoryIndices.includes(value.category))
            .filter(date => {
                if (categoryFilter?.startDate && date.date < categoryFilter?.startDate)
                    return false
                if (categoryFilter?.endDate && date.date > categoryFilter?.endDate)
                    return false
                return true
            })
        return dates
    }

    public async getCategories(): Promise<Map<Category, IDatasetCategory>> {
        await this.load
        return new Map(this.categories.map(c => ([c.category!, c])))
    }

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

    private async loadData(): Promise<void> {
        let dataset: IDatasetEntry[] = await (await fetch("dataset.json")).json()
        for await (const datasetEntry of dataset) {
            let text = await (await fetch(datasetEntry.file)).text()
            let lines = text.split(/\r?\n/)
            lines.splice(0, 1) // Discard headers
            lines.forEach(line => {
                let [area, dateString] = line.replaceAll('"', '').split(',')
                if (area === undefined || dateString === undefined)
                    return
                let [y, m, d] = dateString.split('-').map(e => Number(e))
                let category: IDatasetCategory = {
                    material: Material[datasetEntry.type],
                    region: Region.ZH,
                    area: area,
                    subArea: undefined
                }
                let index = this.getOrAddCategory(category)
                let date = new Date(y, m - 1, d)
                if (!this.data.some(e => e.category === index && e.date === date))
                    this.data.push({
                        category: index,
                        date: date
                    })
            })
        }
    }

    private getShiftedTime(originalTime: Date, timeShift: ITimeDelta): Date {
        let daysShiftInMs = (timeShift.days ?? 0) * 24 * 60 * 60 * 1000
        let hoursShiftInMs = (timeShift.hours ?? 0) * 60 * 60 * 1000
        let minutesShiftInMs = (timeShift.minutes ?? 0) * 60 * 1000
        let shiftedDate = new Date(originalTime)
        shiftedDate.setTime(shiftedDate.getTime() + daysShiftInMs + hoursShiftInMs + minutesShiftInMs)
        return shiftedDate
    }

    private getOrAddCategory(category: IDatasetCategory): Category {
        let existingCategory = this.categories.find(value =>
            value.material === category.material &&
            value.region === category.region &&
            value.area === category.area &&
            value.subArea === category.subArea)

        if (existingCategory && existingCategory.category)
            return existingCategory.category

        return this.categories.push({
            ...category,
            category: this.categories.length + 1
        })
    }
}
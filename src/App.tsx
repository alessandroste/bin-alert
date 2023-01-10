import { IconArrowDownCircle, IconArrowUpRightCircle, IconInfoCircle } from '@tabler/icons'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Calendar, ICalendarOptions, IDatasetFilter, ITimeDelta } from './Calendar/Calendar'
import { CategoryId, IDatasetCategory, IDatasetEvent, Material } from './Calendar/Model'
import { distinctFilter, materialToIcon, materialToText } from './Calendar/Utilities'
import { CalendarView, IDayCell } from './Components/CalendarView'
import { CollapsibleMultiselect } from './Components/CollapsibleMultiselect'
import { downloadTextFile, openTextFile } from './Utilities'

interface IAppOptions {
  calendar: Calendar
}

interface ITimeDeltaDescription extends ITimeDelta {
  text: string
}

function App(options: IAppOptions) {
  interface ISettingsUIState {
    reminderSelectorShowing: boolean
    eventDurationSelectorShowing: boolean
  }

  const calendar = options.calendar

  const reminderOptions: Record<string, ITimeDeltaDescription> = {
    'sameDay-0': { text: 'The same day at midnight' },
    'dayBefore-20': { text: 'The day before at 20:00', days: -1, hours: 20 },
    'sameDay-7': { text: 'The same day at 07:00', hours: 7 },
    'dayBefore-0': { text: 'The day before at midnight', days: -1 },
    'weekBefore-0': { text: 'A week before the collection at midnight', days: -7 }
  }

  const eventDurationOptions: Record<string, ITimeDeltaDescription> = {
    '10min': { text: '10 minutes', minutes: 10 },
    '30min': { text: '30 minutes', minutes: 30 },
    '24h': { text: '24 hours', days: 1 }
  }

  // Data related states
  const [calendarOptions, setCalendarOptions] = useState<ICalendarOptions>()
  const [categories, setCategories] = useState(new Map<CategoryId, IDatasetCategory>())
  const [dates, setDates] = useState(new Array<IDatasetEvent>())
  const [filter, setFilter] = useState<IDatasetFilter>(() => {
    const now = new Date()
    return ({
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate())
    })
  })

  // UI selection states
  const [uiState, setUiState] = useState<ISettingsUIState>({
    reminderSelectorShowing: false,
    eventDurationSelectorShowing: false
  })

  useEffect(() => {
    calendar.getCategories().then(categories => setCategories(categories))
  }, [])

  useEffect(() => {
    calendar.getDates(filter).then(dates => setDates(dates))
  }, [filter])

  const getMaterialOptions = useMemo(() =>
    Array.from(categories.values()).map(c => Material[c.material] as keyof typeof Material).filter(distinctFilter).map((m) =>
      ({ key: m.toString(), value: materialToIcon(m) + ' ' + materialToText(m) })),
    [categories])

  const getAreaOptions = useMemo(() =>
    Array.from(categories.values()).map(c => c.area).filter(distinctFilter).map((a, i) =>
      ({ key: i.toString(), value: a! })),
    [categories])

  useEffect(() => {
    setFilter(f => ({
      ...f,
      materials: getMaterialOptions.map(m => Material[m.key as keyof typeof Material]),
      areas: getAreaOptions.map(a => a.value)
    }))
  }, [getMaterialOptions, getAreaOptions])

  const onDateChange = function (value: string, target: 'start' | 'end') {
    const dateValue = value == '' ? undefined : new Date(value)
    setFilter(f => ({
      ...f,
      startDate: target === 'start' ? dateValue : f.startDate,
      endDate: target === 'end' ? dateValue : f.endDate
    }))
  }

  const onEventDurationChange = function (event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value
    const selectedDuration = Object.entries(eventDurationOptions).find(([key]) => key === id)
    if (!selectedDuration)
      return

    const [, duration] = selectedDuration
    setCalendarOptions(o => ({
      ...o,
      eventDuration: duration
    }))
  }

  const onEventTimeChange = function (event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value
    const selectedTime = Object.entries(reminderOptions).find(([key]) => key === id)
    if (!selectedTime)
      return

    const [, time] = selectedTime
    setCalendarOptions(o => ({
      ...o,
      eventTimeShift: time
    }))
  }

  const onReminderTimeChange = function (event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value
    const selectedTime = Object.entries(reminderOptions).find(([key]) => key === id)
    if (!selectedTime)
      return

    const [, time] = selectedTime
    setCalendarOptions(o => ({
      ...o,
      reminders: [
        time
      ]
    }))
  }

  const categoryToIcon = useMemo(() => function (categoryIdx: CategoryId): string {
    const category = categories?.get(categoryIdx)
    const material = category?.material as Material | keyof typeof Material
    return materialToIcon(material)
  }, [categories])

  const generateDatesViews = useMemo(() => {
    const cells = dates
      .sort((d1, d2) => d1.date.getTime() - d2.date.getTime())
      .reduce((acc: { [key: string]: IDayCell }, value: IDatasetEvent) => {
        const key = value.date.toLocaleDateString('en', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const icon = categoryToIcon(value.category)
        const material = categories?.get(value.category)?.material
        const text = ' ' + (material ? materialToText(material) : '')
        const entry = acc[key] ?? { date: value.date, text: [], tooltip: [] }
        if (!entry.text.includes(icon))
          entry.text.push(icon)
        let tooltipText = icon + text + ' - ' + categories?.get(value.category)?.area
        if (!entry.tooltip?.includes(tooltipText))
          entry.tooltip?.push(tooltipText)
        acc[key] = entry
        return acc
      }, {})
    return Object.values(cells)
  }, [categoryToIcon, dates, categories])

  const getDateValueForInput = function (date: Date | undefined): string | undefined {
    if (date === undefined)
      return undefined
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset * 60 * 1000))
    return date.toISOString().split('T')[0]
  }

  return (
    <div className='container mx-auto px-10'>
      <div className='flex flex-wrap md:flex-nowrap flex-row gap-10 my-10'>
        <div className='basis-full md:basis-1/4 ld:basis-1/3'>
          <div className='card shadow-xl bg-base-100'>
            <div className='card-body'>
              <h2 className='card-title'>Filters</h2>
              <label className='label'>
                <span className='label-text'>Materials</span>
              </label>
              <CollapsibleMultiselect
                selectAll
                items={getMaterialOptions}
                onSelect={items => setFilter(f => ({ ...f, materials: items.map(i => Material[i.key as keyof typeof Material]) }))}
                selectedItems={filter.materials}
              />
              <label className='label'>
                <span className='label-text'>Areas</span>
              </label>
              <CollapsibleMultiselect
                selectAll
                items={getAreaOptions}
                onSelect={items => setFilter(f => ({ ...f, areas: items.map(i => i.value) }))}
                selectedItems={filter.areas}
              />
              <label className='label'>
                <span className='label-text'>Start date</span>
              </label>
              <input className='input'
                type={'date'}
                onChange={e => onDateChange(e.target.value, 'start')}
                value={getDateValueForInput(filter?.startDate)} />
              <label className='label'>
                <span className='label-text'>End date</span>
              </label>
              <input className='input'
                type={'date'}
                onChange={e => onDateChange(e.target.value, 'end')}
                value={getDateValueForInput(filter?.endDate)} />
              <div className='divider'></div>
              <h2 className='card-title'>Event</h2>
              <label className='label'>
                <span className='label-text'>Event time
                  <div className='dropdown'>
                    <label tabIndex={0} className='btn btn-circle btn-ghost btn-xs text-info'>
                      <IconInfoCircle className='w-4 h-4' />
                    </label>
                    <div tabIndex={0} className='card compact dropdown-content shadow bg-base-100 rounded-box w-64'>
                      <div className='card-body'>
                        <p>Event time with respect to the collection date.</p>
                      </div>
                    </div>
                  </div>
                </span>
              </label>
              <select
                className='select'
                onChange={onEventTimeChange}>
                {Array.from(Object.entries(reminderOptions)).map(([k, v]) => (<option key={k} value={k}>{v.text}</option>))}
              </select>
              <label className='label'>
                <span className='label-text'>Custom event duration
                  <div className='dropdown'>
                    <label tabIndex={0} className='btn btn-circle btn-ghost btn-xs text-info'>
                      <IconInfoCircle className='w-4 h-4' />
                    </label>
                    <div tabIndex={0} className='card compact dropdown-content shadow bg-base-100 rounded-box w-64'>
                      <div className='card-body'>
                        <p>Allows to customize the duration of the events. The default value is 15 minutes.</p>
                      </div>
                    </div>
                  </div>
                </span>
                <input
                  type='checkbox'
                  className='toggle label-text-alt'
                  onChange={e => setUiState(state => ({ ...state, eventDurationSelectorShowing: e.target.checked }))}
                  defaultChecked={uiState.eventDurationSelectorShowing} />
              </label>
              {uiState.eventDurationSelectorShowing ? (
                <select
                  className='select'
                  onChange={onEventDurationChange}>
                  {Array.from(Object.entries(eventDurationOptions)).map(([k, v]) => (<option key={k} value={k}>{v.text}</option>))}
                </select>) : undefined}
              <label className='label'>
                <span className='label-text'>Reminder
                  <div className='dropdown'>
                    <label tabIndex={0} className='btn btn-circle btn-ghost btn-xs text-info'>
                      <IconInfoCircle className='w-4 h-4' />
                    </label>
                    <div tabIndex={0} className='card compact dropdown-content shadow bg-base-100 rounded-box w-64'>
                      <div className='card-body'>
                        <p>Allows to set a reminder in the produced calendar for each event. Most of the online calendars do not support these alerts.</p>
                      </div>
                    </div>
                  </div>
                </span>
                <input
                  type='checkbox'
                  className='toggle label-text-alt'
                  onChange={e => setUiState(state => ({ ...state, reminderSelectorShowing: e.target.checked }))}
                  defaultChecked={uiState.reminderSelectorShowing} />
              </label>
              {uiState.reminderSelectorShowing ? (
                <select
                  className='select'
                  onChange={onReminderTimeChange}>
                  {Array.from(Object.entries(reminderOptions)).map(([k, v]) => (<option key={k} value={k}>{v.text}</option>))}
                </select>) : undefined}
              <div className='card-actions justify-end pt-5'>
                <button className='btn btn-primary gap-2'
                  onClick={() => calendar.createICalendar(filter, calendarOptions).then(s => downloadTextFile(s, 'bin-alert.ics'))}>
                  <IconArrowDownCircle className='h-6 w-6' />
                  Download
                </button>
                <button className='btn btn-secondary gap-2'
                  onClick={() => calendar.createICalendar(filter, calendarOptions).then(s => openTextFile(s))}>
                  <IconArrowUpRightCircle className='h-6 w-6' />
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='basis-full md:basis-3/4 ld:basis-2/3'>
          <div className='card shadow-xl bg-base-100'>
            <CalendarView
              entries={generateDatesViews} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
import { IconArrowDownCircle, IconArrowUpRightCircle } from '@tabler/icons'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Calendar, Category, ICalendarOptions, IDatasetCategory, IDatasetEvent, IDatasetFilter, ITimeDelta, Material } from './Calendar/Calendar'
import { distinctFilter } from './Calendar/Utilities'
import { CalendarView } from './Components/CalendarView'
import { CollapsibleMultiselect } from './Components/CollapsibleMultiselect'

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
  const [categories, setCategories] = useState(new Map<Category, IDatasetCategory>())
  const [dates, setDates] = useState(new Array<IDatasetEvent>())
  const [filter, setFilter] = useState<IDatasetFilter>({
    startDate: new Date()
  })
  const [calendarOptions, setCalendarOptions] = useState<ICalendarOptions>()

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

  const getMaterialOptions = useMemo(() => {
    return Array.from(categories.values()).map(c => Material[c.material] as keyof typeof Material).filter(distinctFilter).map((m, i) => {
      return { key: m.toString(), value: Material[m].toString() }
    })
  }, [categories])

  const getAreaOptions = useMemo(() => {
    return Array.from(categories.values()).map(c => c.area).filter(distinctFilter).map((a, i) => {
      return { key: i.toString(), value: a! }
    })
  }, [categories])

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

  const categoryToIcon = useMemo(() => function (categoryIdx: Category): string {
    const category = categories?.get(categoryIdx)
    const material = category?.material as Material | keyof typeof Material
    if (material === undefined)
      return ''
    switch (material) {
      case Material.CARDBOARD:
      case 'CARDBOARD':
        return '📦'
      case Material.PAPER:
      case 'PAPER':
        return '📰'
    }
  }, [categories])

  const generateDatesCards = useMemo(() => {
    return dates
      .sort((d1, d2) => d1.date.getTime() - d2.date.getTime())
      .map((d, i) => {
        const icon = categoryToIcon(d.category)
        return (
          <div key={i} className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              <h2 className='card-title'>
                {d.date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
              </h2>
              <p>
                {icon} {categories?.get(d.category)?.area}
              </p>
            </div>
          </div>)
      })
  }, [categoryToIcon, dates, categories])

  const downloadTextFile = (text: string) => {
    const file = new Blob([text], { type: "text/plain" })
    const element = document.createElement("a")
    element.href = URL.createObjectURL(file)
    element.download = "bin-alert.ics"
    document.body.appendChild(element)
    element.click()
    element.remove()
  };

  const openTextFile = (text: string) => {
    const file = new Blob([text], { type: "text/plain" })
    window.open(URL.createObjectURL(file), '_blank')
  }

  return (
    <div className="container mx-auto px-10">
      <div className='flex flex-wrap md:flex-nowrap flex-row gap-10 my-10'>
        <div className="basis-full md:basis-1/4 ld:basis-1/3">
          <div className='card shadow-xl bg-base-100'>
            <div className='card-body'>
              <h2 className="card-title">Filters</h2>
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
                value={filter.startDate?.toISOString().split('T')[0]} />
              <label className='label'>
                <span className='label-text'>End date</span>
              </label>
              <input className='input'
                type={'date'}
                onChange={e => onDateChange(e.target.value, 'end')} />
              <div className="divider"></div>
              <h2 className="card-title">Event</h2>
              <label className='label'>
                <span className='label-text'>Event time</span>
              </label>
              <select
                className='select'
                onChange={onEventTimeChange}>
                {Array.from(Object.entries(reminderOptions)).map(([k, v]) => (<option key={k} value={k}>{v.text}</option>))}
              </select>
              <label className='label'>
                <span className='label-text'>Custom event duration</span>
                <input
                  type="checkbox"
                  className="toggle label-text-alt"
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
                <span className='label-text'>Reminder</span>
                <input
                  type="checkbox"
                  className="toggle label-text-alt"
                  onChange={e => setUiState(state => ({ ...state, reminderSelectorShowing: e.target.checked }))}
                  defaultChecked={uiState.reminderSelectorShowing} />
              </label>
              {uiState.reminderSelectorShowing ? (
                <select
                  className='select'
                  onChange={onReminderTimeChange}>
                  {Array.from(Object.entries(reminderOptions)).map(([k, v]) => (<option key={k} value={k}>{v.text}</option>))}
                </select>) : undefined}
              <div className="card-actions justify-end pt-5">
                <button className='btn btn-primary gap-2'
                  onClick={() => calendar.createICalendar(filter, calendarOptions).then(s => downloadTextFile(s))}>
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
            <CalendarView />
          </div>
        </div>
      </div>
    </div >
  )
}

export default App
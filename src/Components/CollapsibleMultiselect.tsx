import { ChangeEvent, useEffect, useMemo, useState } from "react"

export type Key = string

export interface Item {
    key: Key,
    value: string
}

export interface ICollapsibleMultiselectOptions {
    items?: Item[],
    onSelect?: (items: Item[]) => void
    selectAll?: boolean
    selectedItems?: Key[]
}

export function CollapsibleMultiselect(options: ICollapsibleMultiselectOptions): JSX.Element {
    const selectAllText = 'All'
    const noneSelectedText = "None selected"
    const allItems = options?.items

    const [selected, setSelected] = useState(new Set<Key>(options?.selectedItems))

    useEffect(() => {
        setSelected(new Set(allItems?.map(i => i.key)))
    }, [allItems])

    const handleChange = function (e: ChangeEvent<HTMLInputElement>) {
        const key = e.target.id
        if (e.target.checked)
            setSelected(s => {
                if (s.has(key))
                    return s
                const n = new Set(s)
                n.add(key)
                return n
            })
        else
            setSelected(s => {
                if (!s.has(key))
                    return s
                const n = new Set(s)
                n.delete(key)
                return n
            })
    }

    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked
        const newState = (checked && allItems) ? allItems.map(i => i.key) : []
        setSelected(new Set(newState))
    }

    const fullSelection = useMemo(() => {
        if (!selected || selected.size === 0)
            return false
        if (allItems && allItems.length === selected.size)
            return true
        // Partial selection
        return false
    }, [selected])

    const drawItem = function (c: boolean, h: (e: ChangeEvent<HTMLInputElement>) => void, v: string, k?: Key) {
        return (
            <div key={k ?? ''} className="form-control">
                <label className="label cursor-pointer">
                    <span className="label-text">{v}</span>
                    <input
                        id={k}
                        type="checkbox"
                        className="checkbox"
                        onChange={h}
                        checked={c} />
                </label>
            </div>)
    }

    const drawItems = useMemo(() => {
        if (!allItems)
            return undefined
        const items: JSX.Element[] = []
        if (options?.selectAll)
            items.push(drawItem(fullSelection, handleSelectAll, selectAllText))
        items.push(...allItems.map(i => drawItem(selected.has(i.key), handleChange, i.value, i.key)))
        return items
    }, [allItems, selected, fullSelection])

    const drawText = useMemo(() => {
        if (!selected || selected.size === 0 || !allItems)
            return noneSelectedText
        if (allItems && selected.size === allItems.length)
            return selectAllText
        return allItems.filter(i => selected.has(i.key)).map(s => s.value).join(', ')
    }, [selected, allItems])

    useEffect(() => {
        if (options?.onSelect && allItems)
            options.onSelect(allItems.filter(i => selected.has(i.key)))
    }, [selected])

    return (
        <div className="collapse collapse-arrow bg-base-100 rounded-box">
            <input type="checkbox" />
            <div className="collapse-title text-ellipsis overflow-hidden whitespace-nowrap">
                {drawText}
            </div>
            <div className="collapse-content overflow-y-auto">
                <div className='max-h-72'>
                    {drawItems}
                </div>
            </div>
        </div>)
}
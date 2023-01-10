import { CategoryId, IDataProvider, IDataset, IDatasetCategory, IDatasetEvent, Material, Region } from "./Model"

export interface IDatasetEntry {
    file: string
    year: number
    type: keyof typeof Material
}

export class StaticDataProvider implements IDataProvider {
    dataset: Promise<IDataset>

    events = new Array<IDatasetEvent>()
    categories = new Map<CategoryId, IDatasetCategory>()

    constructor() {
        this.dataset = this.loadData()
    }

    private async loadData(): Promise<IDataset> {
        const dataset: IDatasetEntry[] = await (await fetch('dataset.json')).json()

        for await (const datasetEntry of dataset) {
            const text = await (await fetch(datasetEntry.file)).text()
            const lines = text.split(/\r?\n/)
            lines.splice(0, 1) // Discard headers
            lines.forEach(line => {
                const [area, dateString] = line.replaceAll('"', '').split(',')
                if (area === undefined || dateString === undefined)
                    return
                const [y, m, d] = dateString.split('-').map(e => Number(e))
                const category: IDatasetCategory = {
                    material: Material[datasetEntry.type],
                    region: Region.ZH,
                    area: area,
                    subArea: undefined
                }
                const index = this.getOrAddCategory(category)
                const date = new Date(y, m - 1, d)
                if (!this.events.some(e => e.category === index && e.date === date))
                    this.events.push({
                        category: index,
                        date: date
                    })
            })
        }

        return ({
            events: this.events,
            categories: this.categories
        })
    }

    private getOrAddCategory(category: IDatasetCategory): CategoryId {
        const existingCategory = Array.from(this.categories.entries()).find(([, value]) =>
            value.material === category.material &&
            value.region === category.region &&
            value.area === category.area &&
            value.subArea === category.subArea)

        if (existingCategory && existingCategory[0])
            return existingCategory[0]

        const nextId = this.categories.size + 1
        this.categories.set(nextId, category)
        return nextId
    }
}
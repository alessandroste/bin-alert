import { CategoryId, IDataProvider, IDataset, IDatasetCategory, IDatasetEvent, Material, Region } from "./Model";

const OpenDataRepo = [
    {
        url: 'https://ckan.opendata.swiss/api/3/action/package_show?id=entsorgungskalender-papier1',
        material: Material.PAPER
    },
    {
        url: 'https://ckan.opendata.swiss/api/3/action/package_show?id=entsorgungskalender-karton1',
        material: Material.CARDBOARD
    },
    {
        url: 'https://ckan.opendata.swiss/api/3/action/package_show?id=entsorgungskalender-bioabfall1',
        material: Material.ORGANIC
    },
    {
        url: 'https://ckan.opendata.swiss/api/3/action/package_show?id=entsorgungskalender-kehricht1',
        material: Material.HOUSEHOLD
    }
]

export interface IOpenDataPackageResponse {
    result: {
        resources: [{
            download_url: string,
            identifier: string,
        }]
    }
}

export interface IOpenDataDatastoreResponse {
    success: boolean,
    result?: {
        records?: string,
        total?: number,
        _links?: {
            start?: string,
            next?: string
        }
    }
}

export class OpenDataProvider implements IDataProvider {
    dataset: Promise<IDataset>

    categories = new Map<CategoryId, IDatasetCategory>()
    events = new Array<IDatasetEvent>()

    constructor() {
        this.dataset = this.loadData()
    }

    private async loadData(): Promise<IDataset> {

        const identifiers = (await Promise.all(OpenDataRepo.map(async resourceClass => {
            const dataSetMetadata = await fetch(resourceClass.url)
            // if (!dataSetMetadata)
            const dataSet: IOpenDataPackageResponse = await dataSetMetadata.json()
            // if (!dataSet)
            return dataSet.result.resources.map(resource => ({ material: resourceClass.material, id: resource.identifier }))
        }))).flat()

        for (const { material, id } of identifiers) {
            const lines = await this.downloadResourceData(id)

            for (const line of lines) {
                if (!line)
                    continue

                const [area, dateString] = line.split(',')
                if (!area || !dateString)
                    continue

                const date = new Date(dateString)
                const category: IDatasetCategory = {
                    material: material,
                    region: Region.ZH,
                    area: area,
                    subArea: undefined
                }
                const index = this.getOrAddCategory(category)
                if (!this.events.some(e => e.category === index && e.date === date))
                    this.events.push({
                        category: index,
                        date: date
                    })
            }
        }

        return ({
            categories: this.categories,
            events: this.events
        })
    }

    private async downloadResourceData(resourceId: string): Promise<string[]> {
        const url = `/api/3/action/datastore_search?resource_id=${resourceId}&limit=1000&records_format=csv&fields=PLZ,Abholdatum`
        return await this.downloadData(url)
    }

    private async downloadData(url: string): Promise<string[]> {
        const baseUrl = 'https://data.stadt-zuerich.ch'
        const response = await (await fetch(baseUrl + url)).json() as IOpenDataDatastoreResponse
        const records = response?.result?.records?.split('\n') ?? []

        if (!records || (records.length === 1 && records[0] === ''))
            return []

        const nextLink = response?.result?._links?.next
        if (nextLink) {
            const recursiveRecords = await this.downloadData(nextLink)
            return [...records, ...recursiveRecords]
        }

        return records
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
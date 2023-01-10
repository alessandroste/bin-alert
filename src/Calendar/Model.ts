export enum Region {
    ZH
}

export enum Material {
    PAPER = 'PAPER',
    CARDBOARD = 'CARDBOARD',
    ORGANIC = 'ORGANIC',
    HOUSEHOLD = 'HOUSEHOLD'
}

export type CategoryId = number

export interface IDatasetEvent {
    category: CategoryId
    date: Date
}

export interface IDatasetCategory {
    material: Material
    region: Region
    area?: string
    subArea?: string
}

export type Categories = Map<CategoryId, IDatasetCategory>

export interface IDataset {
    categories: Categories
    events: IDatasetEvent[]
}

export interface IDataProvider {
    dataset: Promise<IDataset>
}
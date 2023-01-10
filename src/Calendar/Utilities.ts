import { Material } from "./Model"

export function distinctFilter<T>(value: T, index: number, array: T[]) {
    return array.indexOf(value) === index
}

export function materialToIcon(material: Material | keyof typeof Material): string {
    if (material === undefined)
        return ''
    switch (material) {
        case Material.CARDBOARD:
        case 'CARDBOARD':
            return '📦'
        case Material.PAPER:
        case 'PAPER':
            return '📰'
        case 'ORGANIC':
        case Material.ORGANIC:
            return '🌿'
        case 'HOUSEHOLD':
        case Material.HOUSEHOLD:
            return '🏠'
    }
}

export function materialToText(material: Material | keyof typeof Material): string {
    if (material === undefined)
        return ''
    switch (material) {
        case Material.CARDBOARD:
        case 'CARDBOARD':
            return 'Cardboard'
        case Material.PAPER:
        case 'PAPER':
            return 'Paper'
        case 'ORGANIC':
        case Material.ORGANIC:
            return 'Organic'
        case 'HOUSEHOLD':
        case Material.HOUSEHOLD:
            return 'Household'
    }
}
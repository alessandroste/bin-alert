export function distinctFilter<T>(value: T, index: number, array: T[]) {
    return array.indexOf(value) === index
}

export type Nullable<T> = T | null

export type Optional<T> = T | undefined
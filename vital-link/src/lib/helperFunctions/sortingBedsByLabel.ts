export function sortBedsByLabel<T extends { label: string}>(beds: T[]): T[] {
    return [...beds].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" }));
}
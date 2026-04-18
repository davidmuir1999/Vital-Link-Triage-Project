import { sortBedsByLabel } from "./sortingBedsByLabel"; 

describe("Sort bed's in ascending order by label", () => {
    it("should sort beds in ascending order by label", () => {
        const beds = [
            { label: "1" },
            { label: "10" },
            { label: "5" },
            { label: "3" },
        ];
        const sortedBeds = sortBedsByLabel(beds);
        expect(sortedBeds).toEqual([
            { label: "1" },
            { label: "3" },
            { label: "5" },
            { label: "10" },
    ])})
})
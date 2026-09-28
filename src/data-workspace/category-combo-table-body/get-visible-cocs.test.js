import { getVisibleCOCs } from './get-visible-cocs.js'

describe('getVisibleCOCs', () => {
    const getFieldId = (deId, cocId) => `${deId}.${cocId}`
    const coc1 = { id: 'coc1' }
    const coc2 = { id: 'coc2' }
    const coc3 = { id: 'coc3' }
    const sortedCOCs = [coc1, coc2, coc3]
    const de1 = { id: 'de1' }
    const de2 = { id: 'de2' }
    const dataElements = [de1, de2]

    it('should return all COCs if greyedFields is empty', () => {
        const greyedFields = new Set()
        const result = getVisibleCOCs({
            sortedCOCs,
            dataElements,
            greyedFields,
            getFieldId,
        })
        expect(result).toEqual(sortedCOCs)
    })

    it('should return all COCs if greyedFields is null/undefined', () => {
        const result = getVisibleCOCs({
            sortedCOCs,
            dataElements,
            greyedFields: null,
            getFieldId,
        })
        expect(result).toEqual(sortedCOCs)
    })

    it('should return all COCs if dataElements is empty', () => {
        const greyedFields = new Set(['de1.coc1'])
        const result = getVisibleCOCs({
            sortedCOCs,
            dataElements: [],
            greyedFields,
            getFieldId,
        })
        expect(result).toEqual(sortedCOCs)
    })

    it('should filter out COCs where all cells are greyed', () => {
        // Grey out coc2 for both data elements
        const greyedFields = new Set(['de1.coc2', 'de2.coc2'])
        const result = getVisibleCOCs({
            sortedCOCs,
            dataElements,
            greyedFields,
            getFieldId,
        })
        expect(result).toEqual([coc1, coc3])
    })

    it('should NOT filter out COCs where only some cells are greyed', () => {
        // Grey out coc2 for only de1
        const greyedFields = new Set(['de1.coc2'])
        const result = getVisibleCOCs({
            sortedCOCs,
            dataElements,
            greyedFields,
            getFieldId,
        })
        expect(result).toEqual(sortedCOCs)
    })

    it('should return empty array if all COCs are fully greyed', () => {
        const greyedFields = new Set([
            'de1.coc1',
            'de2.coc1',
            'de1.coc2',
            'de2.coc2',
            'de1.coc3',
            'de2.coc3',
        ])
        const result = getVisibleCOCs({
            sortedCOCs,
            dataElements,
            greyedFields,
            getFieldId,
        })
        expect(result).toEqual([])
    })
})

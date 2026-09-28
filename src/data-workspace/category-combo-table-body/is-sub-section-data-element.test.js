import { isSubSectionDataElement } from './is-sub-section-data-element.js'

const getFieldId = (deId, cocId) => `${deId}.${cocId}`

const coc1 = { id: 'coc1' }
const coc2 = { id: 'coc2' }
const sortedCOCs = [coc1, coc2]
const dataElement = { id: 'de1' }

const ALL_GREYED = new Set(['de1.coc1', 'de1.coc2'])

const isSubSection = (overrides) =>
    isSubSectionDataElement({
        dataElement,
        sortedCOCs,
        greyedFields: ALL_GREYED,
        getFieldId,
        ...overrides,
    })

describe('isSubSectionDataElement', () => {
    it('detects a data element with every combo greyed', () => {
        expect(isSubSection()).toBe(true)
    })

    it('does not detect a data element with one editable combo', () => {
        expect(isSubSection({ greyedFields: new Set(['de1.coc1']) })).toBe(
            false
        )
    })

    it('ignores greyed fields belonging to another data element', () => {
        expect(
            isSubSection({ greyedFields: new Set(['de2.coc1', 'de2.coc2']) })
        ).toBe(false)
    })

    it('detects a data element with a default category combo greyed', () => {
        expect(
            isSubSection({
                sortedCOCs: [{ id: 'default' }],
                greyedFields: new Set(['de1.default']),
            })
        ).toBe(true)
    })

    it.each([
        ['greyedFields is empty', new Set()],
        ['greyedFields is null', null],
        ['greyedFields is undefined', undefined],
    ])('returns false when %s', (_label, greyedFields) => {
        expect(isSubSection({ greyedFields })).toBe(false)
    })

    it.each([
        ['sortedCOCs is empty', []],
        ['sortedCOCs is undefined', undefined],
    ])('returns false when %s', (_label, cocs) => {
        expect(isSubSection({ sortedCOCs: cocs })).toBe(false)
    })
})

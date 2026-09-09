import { renderHook } from '@testing-library/react'
import { useDataElementDescriptions } from '../metadata/use-data-element-descriptions.js'
import useHighlightedFieldWithDescriptions from './use-highlighted-field-with-descriptions.js'
import useHighlightedField from './use-highlighted-field.js'

jest.mock('./use-highlighted-field.js')

jest.mock('../metadata/use-data-element-descriptions.js', () => ({
    useDataElementDescriptions: jest.fn(() => ({})),
}))

const DATA_ELEMENT_ID = 'data-element-id'
const OTHER_DATA_ELEMENT_ID = 'other-data-element-id'
const ITEM_DESCRIPTION = 'Number of measles doses given'
const TRANSLATED_DESCRIPTION = 'Nombre de doses de vaccin antirougeoleux'

const HIGHLIGHTED_FIELD = {
    dataElement: DATA_ELEMENT_ID,
    categoryOptionCombo: 'category-option-combo-id',
    categoryOptionComboName: 'Fixed, <1y',
    name: 'Measles doses given',
    displayFormName: 'Measles doses given',
    valueType: 'NUMBER',
    canHaveLimits: true,
    description: ITEM_DESCRIPTION,
}

const renderWithDescriptions = ({
    item = HIGHLIGHTED_FIELD,
    descriptions = {},
}) => {
    useHighlightedField.mockReturnValue(item)
    useDataElementDescriptions.mockReturnValue(descriptions)

    return renderHook(useHighlightedFieldWithDescriptions).result
}

describe('useHighlightedFieldWithDescriptions', () => {
    it('replaces the description with the one of the highlighted data element', () => {
        const result = renderWithDescriptions({
            descriptions: { [DATA_ELEMENT_ID]: TRANSLATED_DESCRIPTION },
        })

        expect(result.current).toEqual({
            ...HIGHLIGHTED_FIELD,
            description: TRANSLATED_DESCRIPTION,
        })
    })

    it('keeps the description of the item when no descriptions have loaded', () => {
        const result = renderWithDescriptions({ descriptions: {} })

        expect(result.current).toEqual(HIGHLIGHTED_FIELD)
    })

    // Distinct from the empty-map case: it proves the lookup is keyed by the
    // data element of the highlighted item, not by any loaded description
    it('keeps the description of the item when only other data elements have one', () => {
        const result = renderWithDescriptions({
            descriptions: { [OTHER_DATA_ELEMENT_ID]: TRANSLATED_DESCRIPTION },
        })

        expect(result.current).toEqual(HIGHLIGHTED_FIELD)
    })

    it('returns null when no field is highlighted', () => {
        const result = renderWithDescriptions({
            item: null,
            descriptions: { [DATA_ELEMENT_ID]: TRANSLATED_DESCRIPTION },
        })

        expect(result.current).toBe(null)
    })
})

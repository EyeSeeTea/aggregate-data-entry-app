import { renderHook } from '@testing-library/react'
import { useMetadata } from '../../shared/metadata/use-metadata.js'
import { useGreyedFieldsAffectLayout } from './use-greyed-fields-affect-layout.js'

jest.mock('../../shared/metadata/use-metadata.js', () => ({
    useMetadata: jest.fn(),
}))

const AGGREGATION_APP_ID = 'aggApp00001'
const REGULAR_ID = 'regular0001'

const metadata = {
    dataSets: {
        [AGGREGATION_APP_ID]: {
            id: AGGREGATION_APP_ID,
            name: 'Mobile data collection: Nutrition',
        },
        [REGULAR_ID]: { id: REGULAR_ID, name: 'Child Health' },
    },
}

const affectsLayout = (dataSetId) => {
    useMetadata.mockReturnValue({ data: metadata })
    return renderHook(() => useGreyedFieldsAffectLayout(dataSetId)).result
        .current
}

describe('useGreyedFieldsAffectLayout', () => {
    it('is true for a regular data set', () => {
        expect(affectsLayout(REGULAR_ID)).toBe(true)
    })

    it('is false for an Aggregation App data set', () => {
        expect(affectsLayout(AGGREGATION_APP_ID)).toBe(false)
    })

    it('is true for a data set id that is not in the metadata', () => {
        expect(affectsLayout('missing0001')).toBe(true)
    })
})

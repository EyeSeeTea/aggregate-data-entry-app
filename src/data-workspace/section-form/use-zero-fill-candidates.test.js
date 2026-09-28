import { selectors } from '../../shared/index.js'
import {
    getZeroFillCandidates,
    isZeroFillDataElement,
} from './use-zero-fill-candidates.js'

jest.mock('../../shared/index.js', () => ({
    selectors: {
        getDataElementsBySection: jest.fn(),
        getSortedCoCsByCatComboId: jest.fn(),
    },
    useMetadata: jest.fn(),
}))

describe('use-zero-fill-candidates', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should identify zero-fill supported data elements', () => {
        expect(
            isZeroFillDataElement({
                zeroIsSignificant: true,
                valueType: 'INTEGER_ZERO_OR_POSITIVE',
            })
        ).toBe(true)

        expect(
            isZeroFillDataElement({
                zeroIsSignificant: false,
                valueType: 'INTEGER_ZERO_OR_POSITIVE',
            })
        ).toBe(false)

        expect(
            isZeroFillDataElement({
                zeroIsSignificant: true,
                valueType: 'PERCENTAGE',
            })
        ).toBe(false)
    })

    it('should return zero-fill candidates only for valid data elements', () => {
        selectors.getDataElementsBySection.mockReturnValue([
            {
                id: 'de1',
                zeroIsSignificant: true,
                valueType: 'INTEGER',
                categoryCombo: { id: 'cc1' },
            },
            {
                id: 'de2',
                zeroIsSignificant: true,
                valueType: 'PERCENTAGE',
                categoryCombo: { id: 'cc2' },
            },
            {
                id: 'de3',
                zeroIsSignificant: false,
                valueType: 'NUMBER',
                categoryCombo: { id: 'cc3' },
            },
        ])

        selectors.getSortedCoCsByCatComboId.mockImplementation((_, ccId) => {
            if (ccId === 'cc1') {
                return [{ id: 'coc1' }, { id: 'coc2' }]
            }

            return []
        })

        const result = getZeroFillCandidates({
            metadata: { id: 'meta' },
            dataSetId: 'ds1',
            sectionId: 'sec1',
        })

        expect(result).toEqual([
            { dataElementId: 'de1', categoryOptionComboId: 'coc1' },
            { dataElementId: 'de1', categoryOptionComboId: 'coc2' },
        ])
    })

    it('should return an empty list when required inputs are missing', () => {
        expect(
            getZeroFillCandidates({
                metadata: null,
                dataSetId: 'ds1',
                sectionId: 'sec1',
            })
        ).toEqual([])
    })
})

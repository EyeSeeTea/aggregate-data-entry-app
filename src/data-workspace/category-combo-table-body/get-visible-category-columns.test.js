import { selectors } from '../../shared/index.js'
import { getVisibleCategoryColumns } from './get-visible-category-columns.js'

jest.mock('../../shared/index.js', () => ({
    selectors: {
        getCategoryOptionsByCategoryId: jest.fn(),
    },
}))

describe('getVisibleCategoryColumns', () => {
    const metadata = { id: 'metadata' }
    const cat1 = {
        id: 'cat1',
        categoryOptions: ['opt1', 'opt2'],
        displayFormName: 'Cat1',
    }
    const cat2 = {
        id: 'cat2',
        categoryOptions: ['opt3', 'opt4'],
        displayFormName: 'Cat2',
    }
    const categories = [cat1, cat2]

    const opt1 = { id: 'opt1', displayFormName: 'Option 1' }
    const opt2 = { id: 'opt2', displayFormName: 'Option 2' }
    const opt3 = { id: 'opt3', displayFormName: 'Option 3' }
    const opt4 = { id: 'opt4', displayFormName: 'Option 4' }

    beforeEach(() => {
        selectors.getCategoryOptionsByCategoryId.mockImplementation(
            (_, catId) => {
                if (catId === 'cat1') {
                    return [opt1, opt2]
                }
                if (catId === 'cat2') {
                    return [opt3, opt4]
                }
                return []
            }
        )
    })

    it('should correctly group headers when all columns are present', () => {
        // COCs: (opt1, opt3), (opt1, opt4), (opt2, opt3), (opt2, opt4)
        const categoryOptionCombos = [
            { id: 'coc1', categoryOptions: ['opt1', 'opt3'] },
            { id: 'coc2', categoryOptions: ['opt1', 'opt4'] },
            { id: 'coc3', categoryOptions: ['opt2', 'opt3'] },
            { id: 'coc4', categoryOptions: ['opt2', 'opt4'] },
        ]

        const { rows } = getVisibleCategoryColumns({
            categories,
            categoryOptionCombos,
            metadata,
        })

        expect(rows).toHaveLength(2)

        // Row 1 (Cat1)
        // Should be: opt1 (span 2), opt2 (span 2)
        expect(rows[0].columns).toHaveLength(2)
        expect(rows[0].columns[0]).toMatchObject({
            categoryOptionId: 'opt1',
            span: 2,
        })
        expect(rows[0].columns[1]).toMatchObject({
            categoryOptionId: 'opt2',
            span: 2,
        })

        // Row 2 (Cat2)
        // Should be: opt3 (span 1), opt4 (span 1), opt3 (span 1), opt4 (span 1)
        expect(rows[1].columns).toHaveLength(4)
        expect(rows[1].columns[0]).toMatchObject({
            categoryOptionId: 'opt3',
            span: 1,
        })
        expect(rows[1].columns[1]).toMatchObject({
            categoryOptionId: 'opt4',
            span: 1,
        })
        expect(rows[1].columns[2]).toMatchObject({
            categoryOptionId: 'opt3',
            span: 1,
        })
        expect(rows[1].columns[3]).toMatchObject({
            categoryOptionId: 'opt4',
            span: 1,
        })
    })

    it('should correctly regroup headers when a column is missing (middle of group)', () => {
        // Remove coc2 (opt1, opt4)
        // COCs: (opt1, opt3), (opt2, opt3), (opt2, opt4)
        const categoryOptionCombos = [
            { id: 'coc1', categoryOptions: ['opt1', 'opt3'] },
            // coc2 removed
            { id: 'coc3', categoryOptions: ['opt2', 'opt3'] },
            { id: 'coc4', categoryOptions: ['opt2', 'opt4'] },
        ]

        const { rows } = getVisibleCategoryColumns({
            categories,
            categoryOptionCombos,
            metadata,
        })

        // Row 1 (Cat1)
        // Should be: opt1 (span 1), opt2 (span 2)
        expect(rows[0].columns).toHaveLength(2)
        expect(rows[0].columns[0]).toMatchObject({
            categoryOptionId: 'opt1',
            span: 1,
        })
        expect(rows[0].columns[1]).toMatchObject({
            categoryOptionId: 'opt2',
            span: 2,
        })

        // Row 2 (Cat2)
        // Should be: opt3 (span 1), opt3 (span 1), opt4 (span 1)
        expect(rows[1].columns).toHaveLength(3)
        expect(rows[1].columns[0]).toMatchObject({
            categoryOptionId: 'opt3',
            span: 1,
        })
        expect(rows[1].columns[1]).toMatchObject({
            categoryOptionId: 'opt3',
            span: 1,
        })
        expect(rows[1].columns[2]).toMatchObject({
            categoryOptionId: 'opt4',
            span: 1,
        })
    })

    it('should correctly regroup headers when a column is missing (start of group)', () => {
        // Remove coc1 (opt1, opt3)
        // COCs: (opt1, opt4), (opt2, opt3), (opt2, opt4)
        const categoryOptionCombos = [
            // coc1 removed
            { id: 'coc2', categoryOptions: ['opt1', 'opt4'] },
            { id: 'coc3', categoryOptions: ['opt2', 'opt3'] },
            { id: 'coc4', categoryOptions: ['opt2', 'opt4'] },
        ]

        const { rows } = getVisibleCategoryColumns({
            categories,
            categoryOptionCombos,
            metadata,
        })

        // Row 1 (Cat1)
        // Should be: opt1 (span 1), opt2 (span 2)
        expect(rows[0].columns).toHaveLength(2)
        expect(rows[0].columns[0]).toMatchObject({
            categoryOptionId: 'opt1',
            span: 1,
        })
        expect(rows[0].columns[1]).toMatchObject({
            categoryOptionId: 'opt2',
            span: 2,
        })
    })

    it('should handle completely empty columns', () => {
        const categoryOptionCombos = []
        const { rows } = getVisibleCategoryColumns({
            categories,
            categoryOptionCombos,
            metadata,
        })

        expect(rows[0].columns).toHaveLength(0)
        expect(rows[1].columns).toHaveLength(0)
    })
})

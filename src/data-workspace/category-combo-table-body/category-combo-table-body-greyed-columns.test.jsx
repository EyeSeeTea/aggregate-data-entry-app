import { Table } from '@dhis2/ui'
import { getAllByTestId, getByTestId } from '@testing-library/react'
import React from 'react'
import { useMetadata } from '../../shared/metadata/use-metadata.js'
import { useDataSetId } from '../../shared/use-context-selection/use-context-selection.js'
import { render } from '../../test-utils/index.js'
import { CategoryComboTableBody } from './category-combo-table-body.jsx'

jest.mock(
    '../../shared/use-context-selection/use-context-selection.js',
    () => ({
        ...jest.requireActual(
            '../../shared/use-context-selection/use-context-selection.js'
        ),
        useDataSetId: jest.fn(),
    })
)

jest.mock('../../shared/metadata/use-metadata.js', () => ({
    useMetadata: jest.fn(),
}))

const MOCK_VALUES = {
    s46m5MS0hxu: {
        Prlt0C1RF0s: {
            value: '10',
        },
        psbwp3CQEhs: {
            value: '20',
        },
        V6L425pT3A0: {
            value: '30',
        },
        hEFKSsPV5et: {
            value: '40',
        },
    },
}

jest.mock('../../shared/stores/data-value-store.js', () => ({
    useValueStore: jest.fn().mockImplementation((func) => {
        const state = {
            getInitialDataValue: ({ dataElementId, categoryOptionComboId }) => {
                return MOCK_VALUES?.[dataElementId]?.[categoryOptionComboId]
                    ?.value
            },
            hasComment: () => false,
            getMinMaxValues: () => [],
            getDataValue: () => '',
            getDataValues: () => {
                return MOCK_VALUES
            },
        }

        return func(state)
    }),
}))

const categories = {
    fMZEcRHuamy: {
        categoryOptions: ['qkPbeWaFsnU', 'wbrDrL2aYEc'],
        displayFormName: 'Location Fixed/Outreach',
        id: 'fMZEcRHuamy',
    },
    YNZyaJHiHYq: {
        categoryOptions: ['btOyqprQ9e8', 'GEqzEKCHoGA'],
        displayFormName: 'EPI/nutrition age',
        id: 'YNZyaJHiHYq',
    },
}

const categoryOptions = {
    qkPbeWaFsnU: {
        displayFormName: 'Fixed',
        displayName: 'Fixed',
        id: 'qkPbeWaFsnU',
        isDefault: false,
    },
    wbrDrL2aYEc: {
        displayFormName: 'Outreach',
        displayName: 'Outreach',
        id: 'wbrDrL2aYEc',
        isDefault: false,
    },
    btOyqprQ9e8: {
        displayFormName: '<1y',
        displayName: '<1y',
        id: 'btOyqprQ9e8',
        isDefault: false,
    },
    GEqzEKCHoGA: {
        displayFormName: '>1y',
        displayName: '>1y',
        id: 'GEqzEKCHoGA',
        isDefault: false,
    },
}

const dataElements = {
    s46m5MS0hxu: {
        categoryCombo: { id: 'dzjKKQq0cSO' },
        displayFormName: 'BCG doses given',
        displayName: 'BCG doses given',
        id: 's46m5MS0hxu',
        valueType: 'INTEGER',
    },
}

const categoryCombos = {
    dzjKKQq0cSO: {
        id: 'dzjKKQq0cSO',
        categories: ['fMZEcRHuamy', 'YNZyaJHiHYq'],
        categoryOptionCombos: [
            {
                categoryOptions: ['wbrDrL2aYEc', 'btOyqprQ9e8'],
                displayName: 'Outreach, <1y',
                id: 'V6L425pT3A0',
            },
            {
                categoryOptions: ['wbrDrL2aYEc', 'GEqzEKCHoGA'],
                displayName: 'Outreach, >1y',
                id: 'hEFKSsPV5et',
            },
            {
                categoryOptions: ['qkPbeWaFsnU', 'btOyqprQ9e8'],
                displayName: 'Fixed, <1y',
                id: 'Prlt0C1RF0s',
            },
            {
                categoryOptions: ['qkPbeWaFsnU', 'GEqzEKCHoGA'],
                displayName: 'Fixed, >1y',
                id: 'psbwp3CQEhs',
            },
        ],
    },
}

const metadata = {
    categories,
    categoryOptions,
    categoryCombos,
    dataElements,
}

describe('<CategoryComboTableBody /> greyed columns', () => {
    useMetadata.mockReturnValue({ data: metadata })
    useDataSetId.mockReturnValue(['dataSet1'])

    it('should hide a column when all cells in that column are greyed', () => {
        const tableDataElements = [dataElements.s46m5MS0hxu]
        const greyedFields = new Set(['s46m5MS0hxu.Prlt0C1RF0s'])

        const result = render(
            <Table>
                <CategoryComboTableBody
                    categoryCombo={categoryCombos.dzjKKQq0cSO}
                    dataElements={tableDataElements}
                    greyedFields={greyedFields}
                    maxColumnsInSection={4}
                />
            </Table>,
            {
                wrapper: ({ children }) => <>{children}</>,
            }
        )

        const inputRows = result.getAllByTestId('dhis2-dataentry-tableinputrow')
        const inputCells = getAllByTestId(
            inputRows[0],
            'dhis2-dataentryapp-dataentrycell'
        )
        const paddingCells = result.queryAllByTestId(
            'dhis2-dataentry-paddingcell'
        )

        expect(inputCells.length).toBe(3)
        expect(paddingCells.length).toBe(0)
    })

    it('should include hidden greyed values in row total and total sum', () => {
        const tableDataElements = [dataElements.s46m5MS0hxu]
        const greyedFields = new Set(['s46m5MS0hxu.Prlt0C1RF0s'])

        const result = render(
            <Table>
                <CategoryComboTableBody
                    categoryCombo={categoryCombos.dzjKKQq0cSO}
                    dataElements={tableDataElements}
                    greyedFields={greyedFields}
                    renderRowTotals
                    renderColumnTotals
                />
            </Table>,
            {
                wrapper: ({ children }) => <>{children}</>,
            }
        )

        const inputRows = result.getAllByTestId('dhis2-dataentry-tableinputrow')
        const rowTotalCell = getByTestId(
            inputRows[0],
            'dhis2-dataentry-totalcell'
        )
        expect(rowTotalCell.textContent).toBe('100')

        const columnTotalsRow = result.getByTestId(
            'dhis2-dataentry-columntotals'
        )
        const totalsCells = getAllByTestId(
            columnTotalsRow,
            'dhis2-dataentry-totalcell'
        )

        expect(totalsCells.length).toBe(4)
        expect(totalsCells[3].textContent).toBe('100')
    })

    it('should keep separate labels for same category option under different parent groups', () => {
        const tableDataElements = [dataElements.s46m5MS0hxu]
        const greyedFields = new Set(['s46m5MS0hxu.V6L425pT3A0'])

        const result = render(
            <Table>
                <CategoryComboTableBody
                    categoryCombo={categoryCombos.dzjKKQq0cSO}
                    dataElements={tableDataElements}
                    greyedFields={greyedFields}
                />
            </Table>,
            {
                wrapper: ({ children }) => <>{children}</>,
            }
        )

        const gtOneHeaders = result.getAllByText('>1y')
        expect(gtOneHeaders.length).toBe(2)
    })
})

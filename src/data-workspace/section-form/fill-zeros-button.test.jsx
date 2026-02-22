import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import {
    FillZerosButton,
    buildZeroMutationVariables,
} from './fill-zeros-button.jsx'
import { useIsOrgUnitClosed } from './use-is-org-unit-closed.js'
import { useZeroFillCandidates } from './use-zero-fill-candidates.js'

const mockMutate = jest.fn()
const mockInvalidateQueries = jest.fn()
const mockSetInitialDataValues = jest.fn()
const mockGetInitialDataValues = jest.fn(() => ({ values: {} }))
const mockGetDataValue = jest.fn(() => undefined)

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => ({ mutate: mockMutate }),
}))

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}))

jest.mock('../../shared/use-data-value-set/index.js', () => ({
    useDataValueSetQueryKey: jest.fn(() => ['dataValueSet']),
}))

jest.mock('../../shared/use-context-selection/index.js', () => ({
    useContextSelection: jest.fn(() => [
        { orgUnitId: 'ou1', periodId: '202401' },
    ]),
    useContextSelectionId: jest.fn(() => 'form-key-1'),
}))

jest.mock('../../shared/index.js', () => ({
    useValueStore: jest.fn((selector) =>
        selector({
            getInitialDataValues: mockGetInitialDataValues,
            setInitialDataValues: mockSetInitialDataValues,
            getDataValue: mockGetDataValue,
        })
    ),
}))

jest.mock('../../shared/use-api-attribute-params.js', () => ({
    useApiAttributeParams: jest.fn(() => ({
        attributeCombo: 'cc1',
        attributeOptions: ['ao1', 'ao2'],
    })),
}))

jest.mock('./use-is-org-unit-closed.js', () => ({
    useIsOrgUnitClosed: jest.fn(() => false),
}))

jest.mock('./use-zero-fill-candidates.js', () => ({
    useZeroFillCandidates: jest.fn(() => [
        { dataElementId: 'de1', categoryOptionComboId: 'coc1' },
        { dataElementId: 'de2', categoryOptionComboId: 'coc2' },
    ]),
}))

describe('FillZerosButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockMutate.mockResolvedValue({})
        mockInvalidateQueries.mockResolvedValue({})
        mockSetInitialDataValues.mockClear()
        mockGetInitialDataValues.mockReturnValue({ values: {} })
        mockGetDataValue.mockReturnValue(undefined)
        useIsOrgUnitClosed.mockReturnValue(false)
        useZeroFillCandidates.mockReturnValue([
            { dataElementId: 'de1', categoryOptionComboId: 'coc1' },
            { dataElementId: 'de2', categoryOptionComboId: 'coc2' },
        ])
    })

    it('should render when section has zero-fill candidates and org unit is open', () => {
        render(<FillZerosButton dataSetId="ds1" sectionId="sec1" />)

        expect(screen.getByText('Fill with zeros')).toBeInTheDocument()
    })

    it('should not render when org unit is closed', () => {
        useIsOrgUnitClosed.mockReturnValue(true)

        render(<FillZerosButton dataSetId="ds1" sectionId="sec1" />)

        expect(screen.queryByText('Fill with zeros')).not.toBeInTheDocument()
    })

    it('should not render when section has no eligible data elements', () => {
        useZeroFillCandidates.mockReturnValue([])

        render(<FillZerosButton dataSetId="ds1" sectionId="sec1" />)

        expect(screen.queryByText('Fill with zeros')).not.toBeInTheDocument()
    })

    it('should save zero values for all candidates when clicked', async () => {
        render(<FillZerosButton dataSetId="ds1" sectionId="sec1" />)

        fireEvent.click(screen.getByText('Fill with zeros'))

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledTimes(2)
        })

        expect(mockMutate).toHaveBeenNthCalledWith(
            1,
            {
                resource: 'dataValues',
                type: 'create',
                data: expect.any(Function),
            },
            {
                variables: {
                    de: 'de1',
                    co: 'coc1',
                    ds: 'ds1',
                    ou: 'ou1',
                    pe: '202401',
                    value: '0',
                    cc: 'cc1',
                    cp: 'ao1;ao2',
                },
            }
        )

        expect(mockInvalidateQueries).toHaveBeenCalledWith(['dataValueSet'])
        expect(mockSetInitialDataValues).toHaveBeenCalledWith(
            {
                de1: { coc1: '0' },
                de2: { coc2: '0' },
            },
            'form-key-1'
        )
    })

    it('should call onFillComplete after saving values', async () => {
        const onFillComplete = jest.fn()

        render(
            <FillZerosButton
                dataSetId="ds1"
                sectionId="sec1"
                onFillComplete={onFillComplete}
            />
        )

        fireEvent.click(screen.getByText('Fill with zeros'))

        await waitFor(() => {
            expect(onFillComplete).toHaveBeenCalledTimes(1)
        })
    })

    it('should only fill empty cells', async () => {
        mockGetDataValue.mockImplementation(
            ({ dataElementId, categoryOptionComboId }) => {
                if (
                    dataElementId === 'de1' &&
                    categoryOptionComboId === 'coc1'
                ) {
                    return { value: '5' }
                }

                return undefined
            }
        )

        render(<FillZerosButton dataSetId="ds1" sectionId="sec1" />)

        fireEvent.click(screen.getByText('Fill with zeros'))

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledTimes(1)
        })

        expect(mockMutate).toHaveBeenCalledWith(
            {
                resource: 'dataValues',
                type: 'create',
                data: expect.any(Function),
            },
            {
                variables: {
                    de: 'de2',
                    co: 'coc2',
                    ds: 'ds1',
                    ou: 'ou1',
                    pe: '202401',
                    value: '0',
                    cc: 'cc1',
                    cp: 'ao1;ao2',
                },
            }
        )

        expect(mockSetInitialDataValues).toHaveBeenCalledWith(
            {
                de1: { coc1: '5' },
                de2: { coc2: '0' },
            },
            'form-key-1'
        )
    })

    it('should not update cells that already have 0', async () => {
        mockGetDataValue.mockImplementation(
            ({ dataElementId, categoryOptionComboId }) => {
                if (
                    dataElementId === 'de1' &&
                    categoryOptionComboId === 'coc1'
                ) {
                    return { value: '0' }
                }

                if (
                    dataElementId === 'de2' &&
                    categoryOptionComboId === 'coc2'
                ) {
                    return { value: 0 }
                }

                return undefined
            }
        )

        render(<FillZerosButton dataSetId="ds1" sectionId="sec1" />)

        fireEvent.click(screen.getByText('Fill with zeros'))

        await waitFor(() => {
            expect(mockMutate).not.toHaveBeenCalled()
        })

        expect(mockSetInitialDataValues).not.toHaveBeenCalled()
        expect(mockInvalidateQueries).not.toHaveBeenCalled()
    })

    it('should not update cells that are greyed', async () => {
        render(
            <FillZerosButton
                dataSetId="ds1"
                sectionId="sec1"
                greyedFields={new Set(['de2.coc2'])}
            />
        )

        fireEvent.click(screen.getByText('Fill with zeros'))

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledTimes(1)
        })

        expect(mockMutate).toHaveBeenCalledWith(
            {
                resource: 'dataValues',
                type: 'create',
                data: expect.any(Function),
            },
            {
                variables: {
                    de: 'de1',
                    co: 'coc1',
                    ds: 'ds1',
                    ou: 'ou1',
                    pe: '202401',
                    value: '0',
                    cc: 'cc1',
                    cp: 'ao1;ao2',
                },
            }
        )

        expect(mockSetInitialDataValues).toHaveBeenCalledWith(
            {
                de1: { coc1: '0' },
            },
            'form-key-1'
        )
    })

    it('should preserve non-empty current values when updating initial values', async () => {
        mockGetInitialDataValues.mockReturnValue({
            values: {
                de1: { coc1: '12' },
                de2: { coc2: '14' },
                de3: { coc3: '0' },
            },
        })

        useZeroFillCandidates.mockReturnValue([
            { dataElementId: 'de1', categoryOptionComboId: 'coc1' },
            { dataElementId: 'de2', categoryOptionComboId: 'coc2' },
            { dataElementId: 'de3', categoryOptionComboId: 'coc3' },
        ])

        mockGetDataValue.mockImplementation(
            ({ dataElementId, categoryOptionComboId }) => {
                if (
                    dataElementId === 'de1' &&
                    categoryOptionComboId === 'coc1'
                ) {
                    return { value: '' }
                }

                if (
                    dataElementId === 'de2' &&
                    categoryOptionComboId === 'coc2'
                ) {
                    return { value: '' }
                }

                if (
                    dataElementId === 'de3' &&
                    categoryOptionComboId === 'coc3'
                ) {
                    return { value: '5' }
                }

                return undefined
            }
        )

        render(<FillZerosButton dataSetId="ds1" sectionId="sec1" />)

        fireEvent.click(screen.getByText('Fill with zeros'))

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledTimes(2)
        })

        expect(mockSetInitialDataValues).toHaveBeenCalledWith(
            {
                de1: { coc1: '0' },
                de2: { coc2: '0' },
                de3: { coc3: '5' },
            },
            'form-key-1'
        )
    })

    it('should build mutation variables without attribute params for default combo', () => {
        const result = buildZeroMutationVariables({
            dataElementId: 'de1',
            categoryOptionComboId: 'coc1',
            dataSetId: 'ds1',
            orgUnitId: 'ou1',
            periodId: '202401',
            attributeCombo: undefined,
            attributeOptions: [],
        })

        expect(result).toEqual({
            de: 'de1',
            co: 'coc1',
            ds: 'ds1',
            ou: 'ou1',
            pe: '202401',
            value: '0',
        })
    })
})

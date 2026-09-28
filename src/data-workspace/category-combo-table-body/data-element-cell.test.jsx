import { screen } from '@testing-library/react'
import React from 'react'
import { render } from '../../test-utils/index.js'
import { DataElementCell } from './data-element-cell.jsx'

jest.mock('../data-entry-cell/use-active-cell.js', () => ({
    useActiveCell: jest.fn(() => ({ deId: undefined, cocId: undefined })),
}))

const FORM_NAME = '----- MSF Promotion -----'
const CELL_TEST_ID = 'dhis2-dataentryapp-dataelementcell'
// `identity-obj-proxy` maps a CSS module import to its own keys, so the class
// name asserted here is the one declared in table-body.module.css
const SUB_SECTION_CLASS = 'subSectionName'

const dataElement = {
    id: 's46m5MS0hxu',
    displayFormName: FORM_NAME,
    valueType: 'NUMBER',
}

const renderCell = ({ isSubSection = false } = {}) =>
    render(
        <table>
            <tbody>
                <tr>
                    <DataElementCell
                        dataElement={dataElement}
                        isSubSection={isSubSection}
                    />
                </tr>
            </tbody>
        </table>
    )

describe('<DataElementCell />', () => {
    it('renders the data element form name inside the cell', () => {
        renderCell()

        expect(screen.getByTestId(CELL_TEST_ID)).toHaveTextContent(FORM_NAME)
    })

    it('does not style a row that is not a sub-section', () => {
        renderCell()

        expect(screen.getByTestId(CELL_TEST_ID)).not.toHaveClass(
            SUB_SECTION_CLASS
        )
    })

    it('styles a sub-section row, keeping the base cell class', () => {
        renderCell({ isSubSection: true })

        const cell = screen.getByTestId(CELL_TEST_ID)
        expect(cell).toHaveClass('dataElementName', SUB_SECTION_CLASS)
        expect(cell).toHaveTextContent(FORM_NAME)
    })
})

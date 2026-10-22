import { TableCell } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useActiveCell } from '../data-entry-cell/index.js'
import styles from '../table-body.module.css'

export const DataElementCell = ({ dataElement, isSubSection }) => {
    const { deId: activeDeId } = useActiveCell()
    return (
        <TableCell
            dataTest="dhis2-dataentryapp-dataelementcell"
            className={cx(styles.dataElementName, {
                [styles.subSectionName]: isSubSection,
                [styles.active]: dataElement.id === activeDeId,
            })}
        >
            {dataElement.displayFormName}
        </TableCell>
    )
}

DataElementCell.propTypes = {
    dataElement: PropTypes.shape({
        id: PropTypes.string.isRequired,
        categoryCombo: PropTypes.shape({
            id: PropTypes.string,
        }),
        displayFormName: PropTypes.string,
        valueType: PropTypes.string,
    }),
    /** True when every category option combo of the row is greyed */
    isSubSection: PropTypes.bool,
}

export default DataElementCell

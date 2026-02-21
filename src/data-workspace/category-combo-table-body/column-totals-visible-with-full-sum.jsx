import i18n from '@dhis2/d2-i18n'
import { TableCellHead, TableRow } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import styles from '../table-body.module.css'
import { calculateColumnTotals } from './calculate-totals.js'
import { TotalCell } from './total-cells.jsx'
import { useValueMatrix } from './use-value-matrix.js'

export const ColumnTotalsVisibleWithFullSum = ({
    dataElements,
    paddingCells,
    renderTotalSum,
    visibleCategoryOptionCombos,
    categoryOptionCombos,
}) => {
    const visibleMatrix = useValueMatrix(
        dataElements,
        visibleCategoryOptionCombos
    )
    const visibleColumnTotals = useMemo(
        () => calculateColumnTotals(visibleMatrix),
        [visibleMatrix]
    )
    const sumMatrix = useValueMatrix(dataElements, categoryOptionCombos)
    const totalSum = useMemo(
        () =>
            calculateColumnTotals(sumMatrix).reduce(
                (acc, curr) => acc + curr,
                0
            ),
        [sumMatrix]
    )

    return (
        <TableRow dataTest="dhis2-dataentry-columntotals">
            <TableCellHead className={styles.totalHeader}>
                {i18n.t('Totals')}
            </TableCellHead>
            {visibleColumnTotals.map((value, index) => (
                <TotalCell key={index}>{value}</TotalCell>
            ))}
            {paddingCells.map((_, index) => (
                <TotalCell key={index} />
            ))}
            {renderTotalSum && <TotalCell>{totalSum}</TotalCell>}
        </TableRow>
    )
}

ColumnTotalsVisibleWithFullSum.propTypes = {
    dataElements: PropTypes.array,
    paddingCells: PropTypes.array,
    renderTotalSum: PropTypes.bool,
    categoryOptionCombos: PropTypes.array,
    visibleCategoryOptionCombos: PropTypes.array,
}

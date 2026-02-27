import i18n from '@dhis2/d2-i18n'
import { TableRowHead, TableCellHead } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import { useMetadata } from '../../shared/index.js'
import { useActiveCell } from '../data-entry-cell/index.js'
import styles from '../table-body.module.css'
import { getVisibleCategoryColumns } from './get-visible-category-columns.js'
import { PaddingCell } from './padding-cell.jsx'
import { TotalHeader } from './total-cells.jsx'

export const CategoryComboTableBodyHeaderVisible = ({
    renderRowTotals,
    paddingCells,
    categoryOptionCombos,
    categories,
    checkTableActive,
    hideRowTotalsDueToNonNumberValueTypes,
}) => {
    const { deId: activeDeId, cocId: activeCocId } = useActiveCell()
    const { data: metadata } = useMetadata()

    const { rows, categoryOptionsLookup } = useMemo(
        () =>
            getVisibleCategoryColumns({
                categories,
                categoryOptionCombos,
                metadata,
            }),
        [categories, categoryOptionCombos, metadata]
    )

    const isHeaderActive = (startColumnIndex, headerColSpan) => {
        const activeCellColIdx = categoryOptionCombos.findIndex(
            (coc) => activeCocId === coc.id
        )
        const idxDiff = activeCellColIdx - startColumnIndex
        return (
            checkTableActive(activeDeId) &&
            idxDiff < headerColSpan &&
            idxDiff >= 0
        )
    }

    return rows.map((row, rowIndex) => {
        const { category, columns } = row
        return (
            <TableRowHead key={category.id}>
                <TableCellHead
                    className={styles.categoryNameHeader}
                    colSpan={'1'}
                >
                    {category.displayFormName !== 'default' &&
                        category.displayFormName}
                </TableCellHead>
                {columns.map((column) => {
                    const categoryOption =
                        categoryOptionsLookup[column.categoryOptionId] || {}
                    return (
                        <TableCellHead
                            key={`${column.categoryOptionId}-${column.startColumnIndex}`}
                            className={cx(styles.tableHeader, {
                                [styles.active]: isHeaderActive(
                                    column.startColumnIndex,
                                    column.span
                                ),
                            })}
                            colSpan={column.span.toString()}
                        >
                            {categoryOption.isDefault
                                ? i18n.t('Value')
                                : categoryOption.displayFormName ??
                                  categoryOption.displayName}
                        </TableCellHead>
                    )
                })}
                {paddingCells.map((_, index) => (
                    <PaddingCell key={index} />
                ))}
                {renderRowTotals && rowIndex === 0 && (
                    <>
                        {hideRowTotalsDueToNonNumberValueTypes ? (
                            <PaddingCell key={'total_header_padding'} />
                        ) : (
                            <TotalHeader rowSpan={categories.length} />
                        )}
                    </>
                )}
            </TableRowHead>
        )
    })
}

CategoryComboTableBodyHeaderVisible.propTypes = {
    categories: PropTypes.array,
    categoryOptionCombos: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            categoryOptions: PropTypes.arrayOf(PropTypes.string),
        })
    ),
    checkTableActive: PropTypes.func,
    hideRowTotalsDueToNonNumberValueTypes: PropTypes.bool,
    paddingCells: PropTypes.array,
    renderRowTotals: PropTypes.bool,
}

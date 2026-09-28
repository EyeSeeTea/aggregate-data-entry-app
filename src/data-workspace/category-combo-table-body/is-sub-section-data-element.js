/**
 * A data element acts as a sub-section separator when every one of its category
 * option combos is greyed in the section: the row has no editable cell at all.
 *
 * It has to be evaluated against `sortedCOCs`, the full set of combos of the
 * category combo, and never against the visible ones: `getVisibleCOCs` has
 * already dropped whole columns and would skew the result.
 */
export const isSubSectionDataElement = ({
    dataElement,
    sortedCOCs,
    greyedFields,
    getFieldId,
}) => {
    if (!greyedFields || greyedFields.size === 0) {
        return false
    }

    if (!sortedCOCs || sortedCOCs.length === 0) {
        return false
    }

    return sortedCOCs.every((coc) =>
        greyedFields.has(getFieldId(dataElement.id, coc.id))
    )
}

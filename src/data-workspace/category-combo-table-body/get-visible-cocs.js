export const getVisibleCOCs = ({
    sortedCOCs = [],
    dataElements = [],
    greyedFields,
    getFieldId,
}) => {
    if (!greyedFields || greyedFields.size === 0) {
        return sortedCOCs
    }

    if (dataElements.length === 0) {
        return sortedCOCs
    }

    return sortedCOCs.filter((coc) =>
        dataElements.some((de) => !greyedFields.has(getFieldId(de.id, coc.id)))
    )
}

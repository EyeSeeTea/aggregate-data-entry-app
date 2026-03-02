import { useMemo } from 'react'
import { useMetadata, selectors } from '../../shared/index.js'
import { VALUE_TYPES } from '../../shared/value-types.js'

const ZERO_FILL_VALUE_TYPES = new Set([
    VALUE_TYPES.NUMBER,
    VALUE_TYPES.INTEGER,
    VALUE_TYPES.INTEGER_ZERO_OR_POSITIVE,
])

export const isZeroFillDataElement = (dataElement) =>
    Boolean(
        dataElement?.zeroIsSignificant &&
            ZERO_FILL_VALUE_TYPES.has(dataElement?.valueType)
    )

export const getZeroFillCandidates = ({ metadata, dataSetId, sectionId }) => {
    if (!metadata || !dataSetId || !sectionId) {
        return []
    }

    const sectionDataElements =
        selectors.getDataElementsBySection(metadata, dataSetId, sectionId) || []

    return sectionDataElements.flatMap((dataElement) => {
        if (
            !isZeroFillDataElement(dataElement) ||
            !dataElement?.categoryCombo?.id
        ) {
            return []
        }

        const cocs =
            selectors.getSortedCoCsByCatComboId(
                metadata,
                dataElement.categoryCombo.id
            ) || []

        return cocs
            .filter((coc) => Boolean(coc?.id))
            .map((coc) => ({
                dataElementId: dataElement.id,
                categoryOptionComboId: coc.id,
            }))
    })
}

export const useZeroFillCandidates = ({ dataSetId, sectionId }) => {
    const { data: metadata } = useMetadata()

    return useMemo(
        () => getZeroFillCandidates({ metadata, dataSetId, sectionId }),
        [metadata, dataSetId, sectionId]
    )
}

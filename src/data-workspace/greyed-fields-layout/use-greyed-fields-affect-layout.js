import { selectors, useMetadata } from '../../shared/index.js'
import { isAggregationAppDataSet } from './is-aggregation-app-data-set.js'

export const useGreyedFieldsAffectLayout = (dataSetId) => {
    const { data: metadata } = useMetadata()
    return !isAggregationAppDataSet(
        selectors.getDataSetById(metadata, dataSetId)
    )
}

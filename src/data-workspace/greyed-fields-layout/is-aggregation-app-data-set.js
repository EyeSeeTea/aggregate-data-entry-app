export const AGGREGATION_APP_DATA_SET_NAME_PREFIX = 'Mobile data collection'

const prefix = AGGREGATION_APP_DATA_SET_NAME_PREFIX.toLowerCase()
const matchedField = (dataSet) => dataSet?.name

export const isAggregationAppDataSet = (dataSet) =>
    Boolean(matchedField(dataSet)?.toLowerCase().startsWith(prefix))

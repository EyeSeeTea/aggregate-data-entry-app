import { useConfig } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import {
    selectors,
    useDataSetId,
    useMetadata,
    useOrgUnit,
    useOrgUnitId,
} from '../../shared/index.js'

export default function usePeriodsWithCategoryOptions(periods) {
    const { systemInfo = {} } = useConfig()
    const { calendar = 'gregory' } = systemInfo
    const { data: metadata } = useMetadata()
    const [dataSetId] = useDataSetId()
    const [orgUnitId] = useOrgUnitId()
    const { data: orgUnitData } = useOrgUnit()
    const orgUnitPath = orgUnitData?.path

    return useMemo(() => {
        if (!orgUnitId || !dataSetId || !metadata) {
            return periods
        }
        const categoryCombo = selectors.getCategoryComboByDataSetId(
            metadata,
            dataSetId
        )
        if (!categoryCombo || categoryCombo.isDefault) {
            return periods
        }
        return periods.filter((period) => {
            const categoriesWithOptions =
                selectors.getCategoriesWithOptionsWithinPeriodWithOrgUnit(
                    metadata,
                    dataSetId,
                    period.id,
                    orgUnitId,
                    orgUnitPath,
                    calendar
                )
            return categoriesWithOptions.every(
                (cat) => cat.categoryOptions.length > 0
            )
        })
    }, [periods, orgUnitId, orgUnitPath, dataSetId, metadata, calendar])
}

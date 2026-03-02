import { useConfig } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import { isDateAGreaterThanDateB } from '../../shared/date/index.js'
import { usePeriod } from '../../shared/period/index.js'
import { usePeriodId } from '../../shared/use-context-selection/index.js'
import { useOrgUnit } from '../../shared/use-org-unit/use-organisation-unit.js'

export const isOrgUnitClosedForPeriod = ({
    orgUnitClosedDate,
    periodEndDate,
    calendar,
}) => {
    if (!orgUnitClosedDate || !periodEndDate) {
        return false
    }

    return !isDateAGreaterThanDateB(
        { date: orgUnitClosedDate, calendar },
        { date: periodEndDate, calendar },
        {
            calendar,
            inclusive: true,
        }
    )
}

export const useIsOrgUnitClosed = () => {
    const { data: { closedDate: orgUnitClosedDate } = {} } = useOrgUnit()
    const [periodId] = usePeriodId()
    const selectedPeriod = usePeriod(periodId)
    const { systemInfo = {} } = useConfig()
    const { calendar } = systemInfo

    return useMemo(
        () =>
            isOrgUnitClosedForPeriod({
                orgUnitClosedDate,
                periodEndDate: selectedPeriod?.endDate,
                calendar,
            }),
        [orgUnitClosedDate, selectedPeriod?.endDate, calendar]
    )
}

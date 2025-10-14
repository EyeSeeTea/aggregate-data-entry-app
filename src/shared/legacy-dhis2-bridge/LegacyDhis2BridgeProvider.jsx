import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { updateDhis2Bridge, initializeDhis2Bridge } from './utils.js'
import { useEmitOnChange } from './useEmit.js'
import { DE_EVENTS, FIELD_EVENTS } from './legacyEvents.js'
import {
    selectors,
    useMetadata,
    usePeriod,
    useDataSetId,
    useOrgUnitId,
    usePeriodId,
} from '../index.js'

const LegacyDhis2BridgeContext = createContext(undefined)

export function LegacyDhis2BridgeProvider({ children }) {
    const value = useLegacyDhis2Bridge()

    const [periodId] = usePeriodId()
    const [dataSetId] = useDataSetId()
    const [orgUnitId] = useOrgUnitId()

    const selectedPeriod = usePeriod(periodId)

    const { data: metadata } = useMetadata()

    useEmitOnChange(selectedPeriod, { eventName: FIELD_EVENTS.period })
    useEmitOnChange(dataSetId, { eventName: FIELD_EVENTS.dataSet })
    useEmitOnChange(orgUnitId, { eventName: FIELD_EVENTS.orgUnit })

    useEffect(() => {
        initializeDhis2Bridge()
    }, [])

    useEffect(() => {
        if (!window.isLegacyDhis2Bridge) return
        updateDhis2Bridge(orgUnitId, dataSetId, selectedPeriod)
    }, [orgUnitId, dataSetId, selectedPeriod])

    return (
        <LegacyDhis2BridgeContext.Provider value={value}>
            {children}
        </LegacyDhis2BridgeContext.Provider>
    )
}

export function useLegacyDhis2BridgeContext() {
    const ctx = useContext(LegacyDhis2BridgeContext)
    if (!ctx)
        throw new Error(
            'useLegacyDhis2BridgeContext must be used within a LegacyDhis2BridgeProvider'
        )
    return ctx
}

function useLegacyDhis2Bridge() {
    const emit = useMemo(() => {
        return (type, detail) => {
            if (typeof window === 'undefined') {
                return false
            }
            const event = new CustomEvent(type, { detail })
            return window.dispatchEvent(event)
        }
    }, [])

    return {
        dhis2: typeof window !== 'undefined' ? window.dhis2 : undefined,
        emit,
    }
}

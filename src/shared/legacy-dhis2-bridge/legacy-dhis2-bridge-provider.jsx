import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { DE_EVENTS, FIELD_EVENTS } from './legacy-events.js'
import {
    usePeriod,
    useDataSetId,
    useOrgUnitId,
    usePeriodId,
} from '../index.js'
import { useEmitOnChange } from "./use-emit";

const LegacyDhis2BridgeContext = createContext(undefined)

export function LegacyDhis2BridgeProvider({ children }) {
    const value = useLegacyDhis2Bridge()

    const [periodId] = usePeriodId()
    const [dataSetId] = useDataSetId()
    const [orgUnitId] = useOrgUnitId()

    const selectedPeriod = usePeriod(periodId)

    useEmitOnChange(selectedPeriod, { eventName: FIELD_EVENTS.period })
    useEmitOnChange(dataSetId, { eventName: FIELD_EVENTS.dataSet })
    useEmitOnChange(orgUnitId, { eventName: FIELD_EVENTS.orgUnit })

    useEffect(() => {
        initializeDhis2Bridge()
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined' || !window.isLegacyDhis2Bridge) return
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

export function initializeDhis2Bridge() {
    if (typeof window === 'undefined') return

    // Only skip if bridge already initialized it
    if (window.isLegacyDhis2Bridge && window.dhis2) return

    window.dhis2 = {
        util: {
            on(type, handler) {
                window.removeEventListener(type, handler)
                window.addEventListener(type, handler)
            },
            off(type, handler) {
                window.removeEventListener(type, handler)
            },
        },
        de: {
            event: { ...DE_EVENTS },
            currentOrganisationUnitId: null,
            currentDataSetId: null,
            getSelectedPeriod() {
                return null
            },
        },
    }
    window.isLegacyDhis2Bridge = true
    console.info('Legacy DHIS2 bridge initialized')
}

function updateDhis2Bridge(orgUnitId, dataSetId, selectedPeriod) {
    if (typeof window === 'undefined' || !window.isLegacyDhis2Bridge) return

    if (window.dhis2?.de) {
        window.dhis2.de.currentOrganisationUnitId = orgUnitId
        window.dhis2.de.currentDataSetId = dataSetId
        window.dhis2.de.getSelectedPeriod = () => selectedPeriod
    }
}

import { DE_EVENTS } from './legacyEvents'

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

export function updateDhis2Bridge(orgUnitId, dataSetId, selectedPeriod) {
    if (typeof window === 'undefined' || !window.isLegacyDhis2Bridge) return

    if (window.dhis2?.de) {
        window.dhis2.de.currentOrganisationUnitId = orgUnitId
        window.dhis2.de.currentDataSetId = dataSetId
        window.dhis2.de.getSelectedPeriod = () => selectedPeriod
    }
}

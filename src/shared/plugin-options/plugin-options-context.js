import { createContext, useContext } from 'react'

export const PluginOptionsContext = createContext({
    hideDataSetSelector: false,
    hideTabSectionSelector: false,
    hideClearSelectionsButton: false,
    hideFilterField: false,
    hideUnassignedOrgUnits: false,
    // Restrict the data set selector to these IDs (undefined: no restriction)
    visibleDataSetIds: undefined,
    // Restrict attribute category options to these IDs (undefined: no restriction)
    visibleCategoryOptionIds: undefined,
    // Restrict the period selector to these IDs (undefined: no restriction)
    visiblePeriodIds: undefined,
})

export const usePluginOptions = () => useContext(PluginOptionsContext)

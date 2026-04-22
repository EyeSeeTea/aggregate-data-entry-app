import { createContext, useContext } from 'react'

export const PluginOptionsContext = createContext({
    hideDataSetSelector: false,
    hideTabSectionSelector: false,
    hideClearSelectionsButton: false,
    hideFilterField: false,
})

export const usePluginOptions = () => useContext(PluginOptionsContext)

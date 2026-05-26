import React from 'react'
import AppWrapper from '../app/app-wrapper.jsx'
import { PluginOptionsContext } from '../shared/plugin-options/index.js'

export default function AppPlugin(props) {
    return (
        <PluginOptionsContext.Provider value={props}>
            <AppWrapper />
        </PluginOptionsContext.Provider>
    )
}

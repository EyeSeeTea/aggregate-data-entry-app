import PropTypes from 'prop-types'
import React from 'react'
import AppPlugin from './app-plugin.jsx'
import LegacyCustomFormPlugin from './index.jsx'

const MODES = {
    CUSTOM_FORM: 'custom-form',
    APP: 'app',
}

// Custom EST mode so we can use the plugin mode not to render custom forms but to
// render a controlled version of the whole app, without header bar and with some
// custom options (coming from plugin-options-context)
export default function Plugin(props) {
    const { mode = MODES.CUSTOM_FORM } = props

    if (mode === MODES.APP) {
        return <AppPlugin {...props} />
    } else {
        return <LegacyCustomFormPlugin {...props} />
    }
}

Plugin.propTypes = {
    mode: PropTypes.oneOf(Object.values(MODES)),
}

import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import useCustomForm from '../../custom-forms/use-custom-form.js'
import { useMetadata } from '../../shared/index.js'
import styles from './custom-form.module.css'
import { parseHtmlToReact } from './parse-html-to-react.jsx'
import { useLegacyDhis2BridgeContext } from '../../shared/legacy-dhis2-bridge/LegacyDhis2BridgeProvider'
import { DE_EVENTS } from '../../shared/legacy-dhis2-bridge/legacyEvents'

export const CustomForm = ({ dataSet }) => {
    const { data: customForm } = useCustomForm({
        id: dataSet.dataEntryForm.id,
        version: dataSet.version,
    })
    const { data: metadata } = useMetadata()
    const { emit } = useLegacyDhis2BridgeContext()

    const containerRef = useRef(null)

    useEffect(() => {
        if (containerRef.current) {
            const scripts = containerRef.current.querySelectorAll('script')

            scripts.forEach((oldScript) => {
                const newScript = document.createElement('script')

                for (const attr of oldScript.attributes) {
                    newScript.setAttribute(attr.name, attr.value)
                }
                newScript.text = oldScript.innerHTML
                oldScript.parentNode.replaceChild(newScript, oldScript)
            })

            // Emit formLoaded after scripts have been injected and executed
            // Use a short delay to allow async script initialization (dependency loading)
            // assuming only custom forms use the legacy bridge now
            setTimeout(() => {
                emit(DE_EVENTS.formLoaded, dataSet.id)
            }, 0)
        }
    }, [customForm, dataSet.id, emit])

    return customForm ? (
        <div className={styles.customForm} ref={containerRef}>
            {parseHtmlToReact(customForm.htmlCode, metadata)}
        </div>
    ) : null
}

CustomForm.propTypes = {
    dataSet: PropTypes.shape({
        dataEntryForm: PropTypes.shape({
            id: PropTypes.string,
        }),
        version: PropTypes.number,
    }),
}

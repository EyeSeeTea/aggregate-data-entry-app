import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import useCustomForm from '../../custom-forms/use-custom-form.js'
import { useMetadata } from '../../shared/index.js'
import styles from './custom-form.module.css'
import { parseHtmlToReact } from './parse-html-to-react.jsx'
import { useRunCustomFormScripts } from "../../shared/legacy-dhis2-bridge/use-run-scripts";

export const CustomForm = ({ dataSet }) => {
    const { data: customForm } = useCustomForm({
        id: dataSet.dataEntryForm.id,
        version: dataSet.version,
    })
    const { data: metadata } = useMetadata()

    const containerRef = useRef(null)

    useRunCustomFormScripts({
        containerRef,
        dataSetId: dataSet.id
    }, [customForm.htmlCode, dataSet.id])


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

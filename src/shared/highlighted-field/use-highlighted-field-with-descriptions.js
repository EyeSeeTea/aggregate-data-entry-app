import { useMemo } from 'react'
import { useDataElementDescriptions } from '../metadata/use-data-element-descriptions.js'
import useHighlightedField from './use-highlighted-field.js'

export default function useHighlightedFieldWithDescriptions() {
    const item = useHighlightedField()
    const descriptions = useDataElementDescriptions()

    return useMemo(() => {
        if (!item) {
            return null
        }

        return {
            ...item,
            description: descriptions[item.dataElement] ?? item.description,
        }
    }, [item, descriptions])
}

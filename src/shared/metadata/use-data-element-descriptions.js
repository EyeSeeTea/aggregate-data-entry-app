import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDataSetId } from '../use-context-selection/use-context-selection.js'
import * as selectors from './selectors.js'
import { useMetadata } from './use-metadata.js'

const CHUNK_SIZE = 100

const queryOpts = {
    refetchOnMount: false,
    staleTime: 24 * 60 * 60 * 1000,
}

export const chunk = (items, size) =>
    Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
        items.slice(index * size, index * size + size)
    )

const getDescriptionsQueryKey = (dataElementIds) => [
    'dataElements',
    {
        params: {
            fields: ['id', 'displayDescription'],
            filter: [`id:in:[${dataElementIds.join(',')}]`],
            paging: false,
        },
    },
]

const toDescriptionEntries = ({ data }) =>
    data?.dataElements
        ?.filter(({ displayDescription }) => displayDescription)
        .map(({ id, displayDescription }) => [id, displayDescription]) ?? []

export const useDataElementDescriptions = () => {
    const [dataSetId] = useDataSetId()
    const { data: metadata } = useMetadata()

    const dataElementIds = useMemo(() => {
        const dataSet =
            metadata && selectors.getDataSetById(metadata, dataSetId)

        return (
            dataSet?.dataSetElements?.map(
                ({ dataElement }) => dataElement.id
            ) ?? []
        )
    }, [metadata, dataSetId])

    const results = useQueries({
        queries: chunk(dataElementIds, CHUNK_SIZE).map((ids) => ({
            ...queryOpts,
            queryKey: getDescriptionsQueryKey(ids),
        })),
    })

    const dataUpdatedAt = results
        .map((result) => result.dataUpdatedAt)
        .join(',')

    return useMemo(
        () => Object.fromEntries(results.flatMap(toDescriptionEntries)),
        // useQueries returns a fresh array every render, dataUpdatedAt only
        // changes when a chunk resolves
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dataUpdatedAt]
    )
}

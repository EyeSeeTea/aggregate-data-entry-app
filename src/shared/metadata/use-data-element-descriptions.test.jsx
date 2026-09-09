import { QueryCache } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { Wrapper } from '../../test-utils/index.js'
import { useDataSetId } from '../use-context-selection/use-context-selection.js'
import { useDataElementDescriptions } from './use-data-element-descriptions.js'
import { useMetadata } from './use-metadata.js'

jest.mock('../use-context-selection/use-context-selection.js', () => ({
    ...jest.requireActual('../use-context-selection/use-context-selection.js'),
    useDataSetId: jest.fn(),
}))

jest.mock('./use-metadata.js', () => ({
    ...jest.requireActual('./use-metadata.js'),
    useMetadata: jest.fn(),
}))

const DATA_ELEMENTS_RESOURCE = 'dataElements'
const DATA_SET_ID = 'data-set-id'
const CATEGORY_COMBO_ID = 'category-combo-id'
const DATA_ELEMENT_ID = 'data-element-id'
const OTHER_DATA_ELEMENT_ID = 'other-data-element-id'
const EMPTY_DESCRIPTION_DATA_ELEMENT_ID = 'empty-description-data-element-id'
const MISSING_DESCRIPTION_DATA_ELEMENT_ID =
    'missing-description-data-element-id'
const DESCRIPTION = 'Number of measles doses given'
const OTHER_DESCRIPTION = 'Number of BCG doses given'
const REQUEST_FAILURE = 'Request failed'
const REQUEST_CHUNK_SIZE = 100
const ID_FILTER_PREFIX = 'id:in:['

const SELECTED_DATA_SET = [DATA_SET_ID]
const NO_DATA_SET_SELECTED = [undefined]
const METADATA_NOT_LOADED = {}

const idFilter = (ids) => [`${ID_FILTER_PREFIX}${ids.join(',')}]`]

const idsInFilter = ([filter]) =>
    filter.slice(ID_FILTER_PREFIX.length, -1).split(',')

const generatedIds = (count) =>
    Array.from({ length: count }, (_, index) => `data-element-id-${index}`)

const descriptionFor = (id) => `Description of ${id}`

const metadataQueryFor = (dataElementIds) => ({
    data: {
        dataSets: {
            [DATA_SET_ID]: {
                id: DATA_SET_ID,
                dataSetElements: dataElementIds.map((id) => ({
                    dataElement: { id },
                    categoryCombo: { id: CATEGORY_COMBO_ID },
                })),
            },
        },
    },
})

const resolverReturning = (dataElementsForIds) =>
    jest.fn((_type, query) => ({
        dataElements: dataElementsForIds(idsInFilter(query.params.filter)),
    }))

const filtersReceivedBy = (resolver) =>
    resolver.mock.calls.map(([, query]) => query.params.filter)

// The app wrapper issues unrelated queries of its own, so the cache holds more
// than the description requests
const descriptionRequestStatuses = (queryCache) =>
    queryCache
        .getAll()
        .filter(({ queryKey }) => queryKey[0] === DATA_ELEMENTS_RESOURCE)
        .map(({ state }) => state.status)

// A request only reaches the resolver a microtask after render, so it has to be
// flushed before a test can assert that none was issued
const flushRequests = () => act(async () => {})

const renderDescriptions = ({
    dataSetSelection = SELECTED_DATA_SET,
    metadataQuery = metadataQueryFor([DATA_ELEMENT_ID, OTHER_DATA_ELEMENT_ID]),
    resolver,
}) => {
    useDataSetId.mockReturnValue(dataSetSelection)
    useMetadata.mockReturnValue(metadataQuery)

    const queryCache = new QueryCache()
    const { result } = renderHook(useDataElementDescriptions, {
        wrapper: ({ children }) => (
            <Wrapper
                queryClientOptions={{ queryCache }}
                dataForCustomProvider={{
                    [DATA_ELEMENTS_RESOURCE]: resolver,
                }}
            >
                {children}
            </Wrapper>
        ),
    })

    return { result, queryCache }
}

describe('useDataElementDescriptions', () => {
    it('maps each data element id to its description', async () => {
        const resolver = resolverReturning(() => [
            { id: DATA_ELEMENT_ID, displayDescription: DESCRIPTION },
            {
                id: OTHER_DATA_ELEMENT_ID,
                displayDescription: OTHER_DESCRIPTION,
            },
        ])

        const { result } = renderDescriptions({ resolver })

        await waitFor(() =>
            expect(result.current).toEqual({
                [DATA_ELEMENT_ID]: DESCRIPTION,
                [OTHER_DATA_ELEMENT_ID]: OTHER_DESCRIPTION,
            })
        )
    })

    it('omits data elements with an empty or absent description', async () => {
        const resolver = resolverReturning(() => [
            { id: DATA_ELEMENT_ID, displayDescription: DESCRIPTION },
            { id: EMPTY_DESCRIPTION_DATA_ELEMENT_ID, displayDescription: '' },
            { id: MISSING_DESCRIPTION_DATA_ELEMENT_ID },
        ])

        const { result } = renderDescriptions({
            metadataQuery: metadataQueryFor([
                DATA_ELEMENT_ID,
                EMPTY_DESCRIPTION_DATA_ELEMENT_ID,
                MISSING_DESCRIPTION_DATA_ELEMENT_ID,
            ]),
            resolver,
        })

        await waitFor(() =>
            expect(result.current).toEqual({ [DATA_ELEMENT_ID]: DESCRIPTION })
        )
    })

    it('requests nothing when no data set is selected', async () => {
        const resolver = resolverReturning(() => [])

        const { result } = renderDescriptions({
            dataSetSelection: NO_DATA_SET_SELECTED,
            resolver,
        })
        await flushRequests()

        expect(result.current).toEqual({})
        expect(resolver).toHaveBeenCalledTimes(0)
    })

    it('requests nothing while the metadata is still loading', async () => {
        const resolver = resolverReturning(() => [])

        const { result } = renderDescriptions({
            metadataQuery: METADATA_NOT_LOADED,
            resolver,
        })
        await flushRequests()

        expect(result.current).toEqual({})
        expect(resolver).toHaveBeenCalledTimes(0)
    })

    it('returns an empty map when the request fails', async () => {
        const resolver = jest.fn(() =>
            Promise.reject(new Error(REQUEST_FAILURE))
        )

        const { result, queryCache } = renderDescriptions({ resolver })

        await waitFor(() =>
            expect(descriptionRequestStatuses(queryCache)).toEqual(['error'])
        )
        expect(result.current).toEqual({})
    })

    it('requests the ids in chunks of a hundred', async () => {
        const ids = generatedIds(150)
        const resolver = resolverReturning((requestedIds) =>
            requestedIds.map((id) => ({
                id,
                displayDescription: descriptionFor(id),
            }))
        )

        const { result } = renderDescriptions({
            metadataQuery: metadataQueryFor(ids),
            resolver,
        })

        await waitFor(() =>
            expect(result.current).toEqual(
                Object.fromEntries(ids.map((id) => [id, descriptionFor(id)]))
            )
        )
        expect(filtersReceivedBy(resolver)).toEqual([
            idFilter(ids.slice(0, REQUEST_CHUNK_SIZE)),
            idFilter(ids.slice(REQUEST_CHUNK_SIZE)),
        ])
    })
})

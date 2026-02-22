import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { useQueryClient } from '@tanstack/react-query'
import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import { useValueStore } from '../../shared/index.js'
import { useApiAttributeParams } from '../../shared/use-api-attribute-params.js'
import {
    useContextSelection,
    useContextSelectionId,
} from '../../shared/use-context-selection/index.js'
import { useDataValueSetQueryKey } from '../../shared/use-data-value-set/index.js'
import { getFieldId } from '../get-field-id.jsx'
import { useIsOrgUnitClosed } from './use-is-org-unit-closed.js'
import { useZeroFillCandidates } from './use-zero-fill-candidates.js'

const SET_DATA_VALUE_MUTATION = {
    resource: 'dataValues',
    type: 'create',
    data: (data) => data,
}

const normalizeValueForInput = (value) => {
    if (value === undefined || value === null) {
        return value
    }

    return String(value)
}

const mapDataValuesStoreToInitialValues = (dataValues = {}) =>
    Object.entries(dataValues).reduce(
        (acc, [dataElementId, categoryOptionCombos]) => ({
            ...acc,
            [dataElementId]: Object.entries(categoryOptionCombos || {}).reduce(
                (innerAcc, [categoryOptionComboId, dataValue]) => ({
                    ...innerAcc,
                    [categoryOptionComboId]: normalizeValueForInput(
                        dataValue?.value
                    ),
                }),
                {}
            ),
        }),
        {}
    )

const buildZeroMutationVariables = ({
    dataElementId,
    categoryOptionComboId,
    dataSetId,
    orgUnitId,
    periodId,
    attributeCombo,
    attributeOptions,
}) => {
    const variables = {
        de: dataElementId,
        co: categoryOptionComboId,
        ds: dataSetId,
        ou: orgUnitId,
        pe: periodId,
        value: '0',
    }

    if (attributeCombo) {
        variables.cc = attributeCombo
        variables.cp = attributeOptions.join(';')
    }

    return variables
}

export const FillZerosButton = ({
    dataSetId,
    sectionId,
    onFillComplete,
    greyedFields,
}) => {
    const [isSaving, setIsSaving] = useState(false)
    const queryClient = useQueryClient()
    const engine = useDataEngine()
    const dataValueSetQueryKey = useDataValueSetQueryKey()
    const formKey = useContextSelectionId()
    const [{ orgUnitId, periodId }] = useContextSelection()
    const { attributeCombo, attributeOptions } = useApiAttributeParams() || {}
    const zeroFillCandidates = useZeroFillCandidates({ dataSetId, sectionId })
    const isOrgUnitClosed = useIsOrgUnitClosed()
    const getInitialDataValues = useValueStore(
        (state) => state.getInitialDataValues
    )
    const setInitialDataValues = useValueStore(
        (state) => state.setInitialDataValues
    )
    const getDataValue = useValueStore((state) => state.getDataValue)
    const getDataValues = useValueStore((state) => state.getDataValues)

    const showButton = !isOrgUnitClosed && zeroFillCandidates.length > 0

    const onFillWithZeros = useCallback(async () => {
        if (isSaving || !periodId) {
            return
        }

        setIsSaving(true)

        try {
            const currentInitialDataValues =
                getInitialDataValues()?.values || {}
            const currentStoreDataValues = mapDataValuesStoreToInitialValues(
                getDataValues()
            )
            const hasCurrentStoreValues =
                Object.keys(currentStoreDataValues).length > 0
            const currentBaseValues = hasCurrentStoreValues
                ? currentStoreDataValues
                : currentInitialDataValues
            const candidateValuesByFieldId = new Map()

            const emptyCandidates = zeroFillCandidates.filter(
                ({ dataElementId, categoryOptionComboId }) => {
                    const fieldId = getFieldId(
                        dataElementId,
                        categoryOptionComboId
                    )

                    if (greyedFields?.has(fieldId)) {
                        return false
                    }

                    const currentDataValue = getDataValue({
                        dataElementId,
                        categoryOptionComboId,
                    })
                    const currentValue =
                        currentDataValue?.value ??
                        currentBaseValues[dataElementId]?.[
                            categoryOptionComboId
                        ]
                    candidateValuesByFieldId.set(fieldId, currentValue)

                    return (
                        currentValue === undefined ||
                        currentValue === null ||
                        currentValue === ''
                    )
                }
            )

            if (emptyCandidates.length === 0) {
                return
            }

            await Promise.all(
                emptyCandidates.map(
                    ({ dataElementId, categoryOptionComboId }) =>
                        engine.mutate(SET_DATA_VALUE_MUTATION, {
                            variables: buildZeroMutationVariables({
                                dataElementId,
                                categoryOptionComboId,
                                dataSetId,
                                orgUnitId,
                                periodId,
                                attributeCombo,
                                attributeOptions: attributeOptions || [],
                            }),
                        })
                )
            )

            const nextInitialDataValues = { ...currentBaseValues }

            zeroFillCandidates.forEach(
                ({ dataElementId, categoryOptionComboId }) => {
                    const fieldId = getFieldId(
                        dataElementId,
                        categoryOptionComboId
                    )
                    const currentValue = candidateValuesByFieldId.get(fieldId)

                    if (
                        currentValue !== undefined &&
                        currentValue !== null &&
                        currentValue !== ''
                    ) {
                        nextInitialDataValues[dataElementId] = {
                            ...(nextInitialDataValues[dataElementId] || {}),
                            [categoryOptionComboId]: `${currentValue}`,
                        }
                    }
                }
            )

            emptyCandidates.forEach(
                ({ dataElementId, categoryOptionComboId }) => {
                    nextInitialDataValues[dataElementId] = {
                        ...(nextInitialDataValues[dataElementId] || {}),
                        [categoryOptionComboId]: '0',
                    }
                }
            )

            setInitialDataValues(nextInitialDataValues, formKey)
            onFillComplete?.()

            await queryClient.invalidateQueries(dataValueSetQueryKey)
        } finally {
            setIsSaving(false)
        }
    }, [
        isSaving,
        periodId,
        zeroFillCandidates,
        engine,
        dataSetId,
        orgUnitId,
        attributeCombo,
        attributeOptions,
        getInitialDataValues,
        getDataValue,
        getDataValues,
        setInitialDataValues,
        formKey,
        onFillComplete,
        greyedFields,
        queryClient,
        dataValueSetQueryKey,
    ])

    if (!showButton) {
        return null
    }

    return (
        <Button
            small
            secondary
            onClick={onFillWithZeros}
            loading={isSaving}
            disabled={isSaving}
        >
            {i18n.t('Fill with zeros')}
        </Button>
    )
}

FillZerosButton.propTypes = {
    dataSetId: PropTypes.string,
    greyedFields: PropTypes.instanceOf(Set),
    sectionId: PropTypes.string,
    onFillComplete: PropTypes.func,
}

export { buildZeroMutationVariables }

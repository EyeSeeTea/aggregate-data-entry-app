import { selectors } from '../../shared/index.js'

export const getVisibleCategoryColumns = ({
    categories,
    categoryOptionCombos,
    metadata,
}) => {
    const categoryOptionsLookup = categories.reduce((acc, category) => {
        const categoryOptions = selectors.getCategoryOptionsByCategoryId(
            metadata,
            category.id
        )
        return categoryOptions.reduce(
            (innerAcc, option) => ({
                ...innerAcc,
                [option.id]: option,
            }),
            acc
        )
    }, {})

    const getCategoryOptionId = (coc, category) => {
        const categoryOptionIds = new Set(category.categoryOptions)
        return coc.categoryOptions?.find((id) => categoryOptionIds.has(id))
    }

    const rows = categories.map((category, categoryIndex) => {
        const parentCategories = categories.slice(0, categoryIndex)
        const categoryOptionIds = new Set(category.categoryOptions)
        const columns = categoryOptionCombos.reduce((acc, coc, cocIndex) => {
            const categoryOptionId = coc.categoryOptions?.find((id) =>
                categoryOptionIds.has(id)
            )
            if (!categoryOptionId) {
                return acc
            }

            const previousColumn = acc[acc.length - 1]
            const parentSignature = parentCategories
                .map((parentCategory) =>
                    getCategoryOptionId(coc, parentCategory)
                )
                .join('|')
            if (
                previousColumn &&
                previousColumn.categoryOptionId === categoryOptionId &&
                previousColumn.parentSignature === parentSignature
            ) {
                return [
                    ...acc.slice(0, -1),
                    {
                        ...previousColumn,
                        span: previousColumn.span + 1,
                    },
                ]
            }

            return [
                ...acc,
                {
                    categoryOptionId,
                    parentSignature,
                    span: 1,
                    startColumnIndex: cocIndex,
                },
            ]
        }, [])

        return {
            category,
            columns,
        }
    })

    return {
        rows,
        categoryOptionsLookup,
    }
}

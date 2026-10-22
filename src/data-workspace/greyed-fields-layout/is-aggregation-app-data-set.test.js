import {
    AGGREGATION_APP_DATA_SET_NAME_PREFIX,
    isAggregationAppDataSet,
} from './is-aggregation-app-data-set.js'

const PREFIX = AGGREGATION_APP_DATA_SET_NAME_PREFIX

describe('isAggregationAppDataSet', () => {
    describe('matches', () => {
        it.each([
            ['the prefix alone', PREFIX],
            ['the prefix with the client punctuation', `${PREFIX}: Nutrition`],
            ['the prefix without punctuation', `${PREFIX} Nutrition`],
            ['all lower case', PREFIX.toLowerCase()],
            ['all upper case', PREFIX.toUpperCase()],
            ['mixed case', 'MoBiLe DaTa CoLlEcTiOn: Nutrition'],
        ])('%s', (_label, name) => {
            expect(isAggregationAppDataSet({ name })).toBe(true)
        })
    })

    describe('does not match', () => {
        it.each([
            ['an unrelated name', 'Child Health'],
            ['the prefix in the middle', `Weekly ${PREFIX}`],
            ['a truncated prefix', 'Mobile data'],
            ['an empty name', ''],
            ['a data set with no name', undefined],
        ])('%s', (_label, name) => {
            expect(isAggregationAppDataSet({ name })).toBe(false)
        })

        it.each([
            ['undefined', undefined],
            ['null', null],
        ])('an %s data set', (_label, dataSet) => {
            expect(isAggregationAppDataSet(dataSet)).toBe(false)
        })
    })
})

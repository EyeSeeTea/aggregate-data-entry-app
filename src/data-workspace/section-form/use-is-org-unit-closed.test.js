import { isOrgUnitClosedForPeriod } from './use-is-org-unit-closed.js'

describe('use-is-org-unit-closed', () => {
    it('should return false when there is no closed date', () => {
        expect(
            isOrgUnitClosedForPeriod({
                orgUnitClosedDate: null,
                periodEndDate: '2024-02-01',
                calendar: 'iso8601',
            })
        ).toBe(false)
    })

    it('should return false when org unit closes after period end', () => {
        expect(
            isOrgUnitClosedForPeriod({
                orgUnitClosedDate: '2024-03-01',
                periodEndDate: '2024-02-01',
                calendar: 'iso8601',
            })
        ).toBe(false)
    })

    it('should return false when org unit closes on period end', () => {
        expect(
            isOrgUnitClosedForPeriod({
                orgUnitClosedDate: '2024-02-01',
                periodEndDate: '2024-02-01',
                calendar: 'iso8601',
            })
        ).toBe(false)
    })

    it('should return true when org unit closes before period end', () => {
        expect(
            isOrgUnitClosedForPeriod({
                orgUnitClosedDate: '2024-01-20',
                periodEndDate: '2024-02-01',
                calendar: 'iso8601',
            })
        ).toBe(true)
    })
})

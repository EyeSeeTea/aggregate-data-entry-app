import { useCallback } from 'react'

export function useCustomEvent(opts) {
    const { target = typeof window !== 'undefined' ? window : null } =
        opts || {}

    return useCallback(
        (type, detail, options) => {
            if (!target) return false
            const evt = new CustomEvent(type, {
                detail,
                bubbles: options?.bubbles ?? false,
                cancelable: options?.cancelable ?? false,
                composed: options?.composed ?? false,
            })
            return target.dispatchEvent(evt)
        },
        [target]
    )
}

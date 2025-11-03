import { useCallback, useEffect, useRef } from 'react'

export function useCustomEvent(opts) {
    const { target = typeof window !== 'undefined' ? window : null } =
        opts || {}

    return useCallback(
        (type, detail) => {
            if (!target) return false
            const evt = new CustomEvent(type, {
                detail
            })
            return target.dispatchEvent(evt)
        },
        [target]
    )
}

export function useEmitOnSet(setFn, { eventName, target, mapDetail }) {
    const emit = useCustomEvent({ target });

    return useCallback((value) => {
        setFn(value);
        const detail = typeof mapDetail === "function" ? mapDetail(value) : value;
        emit(eventName, detail);
    }, [setFn, emit, eventName, mapDetail]);
}

export function useEmitOnChange(value, { eventName, target, mapDetail, fireOnMount = false }) {
    const emit = useCustomEvent({ target });
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            if (!fireOnMount) {
                return;
            }
        }

        const detail = typeof mapDetail === "function" ? mapDetail(value) : value;
        emit(eventName, detail);
    }, [value, emit, eventName, mapDetail, fireOnMount]);
}

import { useCallback, useEffect, useRef } from "react";
import { useCustomEvent } from "./useCustomEvent";

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
    const first = useRef(true);

    useEffect(() => {
        if (!fireOnMount && first.current) {
            first.current = false;
            return;
        }
        first.current = false;

        const detail = typeof mapDetail === "function" ? mapDetail(value) : value;
        emit(eventName, detail);
    }, [value, emit, eventName, mapDetail, fireOnMount]);
}

import { useRef, useEffect } from 'react';
import { DE_EVENTS } from './legacy-events';
import { useCustomEvent } from './use-emit';

export function useRunCustomFormScripts(
    { containerRef, dataSetId }, deps
) {
    const ranRef = useRef(false);
    const emit = useCustomEvent();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (ranRef.current) return;
        ranRef.current = true;

        let cancelled = false;
        (async () => {
            await runScriptsInOrder(container);
            if (!cancelled) emit(DE_EVENTS.formLoaded, dataSetId);
        })();

        return () => { cancelled = true; };
    }, deps);
}

function runScriptsInOrder(container) {
    const originals = [...container.querySelectorAll('script')];

    return originals.reduce((chain, old) => {
        return chain.then(() => new Promise((resolve) => {
            const s = document.createElement('script');
            copyOrderedAttrs(old, s);

            const type = (old.getAttribute('type') || '').trim();
            const isModule = type === 'module';

            s.onload = () => resolve();
            s.onerror = () => resolve();

            if (!old.src) {
                s.text = old.text || old.innerHTML || '';
            } else {
                s.async = false;
                s.defer = false;
            }

            if (old.parentNode) old.parentNode.replaceChild(s, old);

            if (!old.src && !isModule) {
                setTimeout(resolve, 0);
            }
        }));
    }, Promise.resolve());
}

function copyOrderedAttrs(src, dst) {
    for (const { name, value } of Array.from(src.attributes)) {
        if (name === 'async' || name === 'defer') continue;
        dst.setAttribute(name, value);
    }
}

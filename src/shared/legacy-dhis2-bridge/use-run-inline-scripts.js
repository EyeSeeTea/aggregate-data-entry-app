import { useEffect } from 'react';
import { DE_EVENTS } from './legacy-events';
import { useCustomEvent } from './use-emit';

export function useRunInlineScripts(
    { containerRef, dataSetId }, deps
) {
    const emit = useCustomEvent();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let cancelled = false;
        (async () => {
            await runInlineScripts(container);
            if (!cancelled) emit(DE_EVENTS.formLoaded, dataSetId);
        })();

        return () => { cancelled = true; };
    }, deps);
}

function runInlineScripts(container) {
    const scripts = [...container.querySelectorAll('script:not([src])')];

    return scripts.reduce((chain, script) => {
        return chain.then(() => new Promise((resolve) => {
            const injScript = document.createElement('script');
            copyAttrs(script, injScript);

            injScript.text = script.text || script.innerHTML || '';

            if (script.parentNode) script.parentNode.replaceChild(injScript, script);

            Promise.resolve().then(resolve)
        }));
    }, Promise.resolve());
}

function copyAttrs(src, dst) {
    for (const { name, value } of Array.from(src.attributes)) {
        if (name === 'type' || name === 'async' || name === 'defer') continue;
        dst.setAttribute(name, value);
    }
}

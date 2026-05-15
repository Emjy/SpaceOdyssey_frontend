'use client';

import { useState, useEffect, useRef } from 'react';

const cache = new Map();

function truncateExtract(text, max = 320) {
    if (!text || text.length <= max) return text;
    const cut = text.lastIndexOf('. ', max);
    return cut > max * 0.45 ? text.slice(0, cut + 1) : text.slice(0, max) + '…';
}

async function fetchSummary(title, lang, signal) {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === 'disambiguation' || !data.extract) return null;
    return {
        extract: truncateExtract(data.extract),
        url: data.content_urls?.desktop?.page ?? null,
        thumbnail: data.thumbnail?.source ?? null,
        lang,
    };
}

export default function useWikipedia(frName, enName) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => {
        const fr = frName?.trim() || null;
        const en = enName?.trim() || null;
        const frFirst = fr ?? en; // toujours tenter FR d'abord, même avec le nom anglais
        if (!frFirst && !en) { setResult(null); setLoading(false); return; }

        const key = `${fr ?? ''}|${en ?? ''}`;
        if (cache.has(key)) { setResult(cache.get(key)); setLoading(false); return; }

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setResult(null);

        (async () => {
            try {
                // Essai FR d'abord (même avec nom anglais), puis EN si FR échoue
                const attempts = [
                    frFirst ? ['fr', frFirst] : null,
                    en && en !== frFirst ? ['en', en] : null,
                ].filter(Boolean);

                for (const [lang, title] of attempts) {
                    const res = await fetchSummary(title, lang, controller.signal);
                    if (res) {
                        cache.set(key, res);
                        setResult(res);
                        setLoading(false);
                        return;
                    }
                }
                cache.set(key, null);
                setLoading(false);
            } catch (e) {
                if (e.name !== 'AbortError') setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [frName, enName]);

    return { result, loading };
}

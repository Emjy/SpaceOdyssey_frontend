'use client';

import { useEffect, useRef, useState } from 'react';

const cache = new Map();

function getGalaxyQuery(infos) {
    if (infos?.id === 'milkyway') return 'Milky Way galaxy';
    if (infos?.id === 'andromeda') return 'Andromeda Galaxy';
    const sourceId = infos?.sourceId ?? '';
    if (sourceId) return `${sourceId} galaxy`;
    const name = infos?.englishName ?? infos?.name ?? '';
    if (!name) return null;
    return name.toLowerCase().includes('galaxy') ? name : `${name} galaxy`;
}

function buildGalaxyQueries(infos) {
    const sourceId = infos?.sourceId ?? null;
    const englishName = infos?.englishName ?? null;
    const displayName = infos?.name ?? null;

    return [
        getGalaxyQuery(infos),
        sourceId ? sourceId : null,
        sourceId ? `${sourceId}`.replace(/\s+/g, '') : null,
        sourceId ? `${sourceId} galaxy` : null,
        englishName ? `${englishName} galaxy` : null,
        englishName,
        displayName ? `${displayName} galaxy` : null,
        displayName,
    ].filter(Boolean).filter((value, index, array) => array.indexOf(value) === index);
}

async function fetchNasaImage(queries, signal) {
    const scoreItem = (item, query) => {
        const title = String(item?.data?.[0]?.title ?? '').toLowerCase();
        const description = String(item?.data?.[0]?.description ?? '').toLowerCase();
        const haystack = `${title} ${description}`;
        const q = String(query).toLowerCase();
        let score = 0;
        if (haystack.includes(q)) score += 8;
        if (q.includes('m') && haystack.includes(q.replace(/\s+/g, ''))) score += 4;
        if (haystack.includes('galaxy')) score += 2;
        return score;
    };

    for (const query of queries) {
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
        const res = await fetch(url, { signal });
        if (!res.ok) continue;
        const data = await res.json();
        const items = data?.collection?.items ?? [];

        const sorted = [...items].sort((a, b) => scoreItem(b, query) - scoreItem(a, query));
        for (const item of sorted) {
            if (scoreItem(item, query) < 6) continue;
            const meta = item?.data?.[0];
            const thumb = item?.links?.find((link) => link.render === 'image')?.href ?? item?.links?.[0]?.href ?? null;
            const nasaId = meta?.nasa_id ?? null;
            if (!thumb || !nasaId) continue;
            return {
                title: meta?.title ?? query,
                description: meta?.description ?? null,
                thumbnail: thumb,
                nasaId,
                url: `https://images.nasa.gov/details/${encodeURIComponent(nasaId)}`,
            };
        }
    }

    return null;
}

export default function useNasaMedia(infos) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => {
        if (infos?.bodyType !== 'Galaxy') {
            setResult(null);
            setLoading(false);
            return;
        }

        const queries = buildGalaxyQueries(infos);
        if (!queries.length) {
            setResult(null);
            setLoading(false);
            return;
        }

        const cacheKey = queries.join('|');
        if (cache.has(cacheKey)) {
            setResult(cache.get(cacheKey));
            setLoading(false);
            return;
        }

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setResult(null);

        (async () => {
            try {
                const media = await fetchNasaImage(queries, controller.signal);
                cache.set(cacheKey, media);
                setResult(media);
                setLoading(false);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    cache.set(cacheKey, null);
                    setLoading(false);
                }
            }
        })();

        return () => controller.abort();
    }, [infos]);

    return { result, loading };
}

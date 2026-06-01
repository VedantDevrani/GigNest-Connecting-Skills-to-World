'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type CacheEntry = { data: unknown; timestamp: number };

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60_000;

export function invalidateCache(keyPrefix?: string) {
    if (!keyPrefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.startsWith(keyPrefix)) cache.delete(key);
    }
}

export function useCachedFetch<T>(
    key: string,
    url: string,
    extractKey?: string
) {
    const entry = cache.get(key);
    const isFresh = entry && Date.now() - entry.timestamp < CACHE_TTL;

    const [data, setData] = useState<T | null>(isFresh ? (entry!.data as T) : null);
    const [loading, setLoading] = useState(!isFresh);
    const [error, setError] = useState('');
    const dataRef = useRef(data);
    dataRef.current = data;

    const refetch = useCallback(async (silent = false) => {
        if (!silent && dataRef.current === null) setLoading(true);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to load');
            const json = await res.json();
            const result = (extractKey ? json[extractKey] : json) as T;
            cache.set(key, { data: result, timestamp: Date.now() });
            setData(result);
            setError('');
        } catch (err) {
            if (dataRef.current === null) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    }, [key, url, extractKey]);

    useEffect(() => {
        refetch(!isFresh);
    }, [key, url]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        data,
        loading: loading && data === null,
        error,
        refetch: (silent = false) => refetch(silent),
    };
}

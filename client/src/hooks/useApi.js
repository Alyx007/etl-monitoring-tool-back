import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(fetcher, deps = [], { pollInterval = 0 } = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const load = useCallback(async () => {
        setLoading((prev) => prev || data === null);
        setError(null);
        try {
            const result = await fetcherRef.current();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!pollInterval) return;
        const id = setInterval(load, pollInterval);
        return () => clearInterval(id);
    }, [load, pollInterval]);

    return { data, loading, error, reload: load };
}

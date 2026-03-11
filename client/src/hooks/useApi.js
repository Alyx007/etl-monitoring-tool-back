import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(fetcher, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const load = useCallback(async () => {
        setLoading(true);
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

    return { data, loading, error, reload: load };
}

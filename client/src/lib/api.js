const BASE = '/api';

async function request(path) {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
    }
    return res.json();
}

export function fetchSummary() {
    return request('/etl/summary');
}

export function fetchRuns({ page = 1, limit = 20, status, from, to } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return request(`/etl/runs?${params}`);
}

export function fetchPrices({ page = 1, limit = 20 } = {}) {
    return request(`/etl/prices?${params(page, limit)}`);
}

function params(page, limit) {
    return new URLSearchParams({ page, limit }).toString();
}

export function fetchPriceHistory(coinId, limit = 100) {
    return request(`/etl/prices/${coinId}/history?limit=${limit}`);
}

export function fetchRunChecks(runId) {
    return request(`/etl/runs/${runId}/checks`);
}

export function fetchHealth() {
    return request('/health');
}

export function triggerCryptoRun() {
    return fetch(`${BASE}/etl/run/crypto`, { method: 'POST' }).then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Trigger failed');
        return body;
    });
}

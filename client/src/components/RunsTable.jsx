import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { fetchRuns, fetchRunChecks } from '../lib/api';
import StatusBadge from './StatusBadge';

export default function RunsTable() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const { data, loading, error } = useApi(
        () => fetchRuns({ page, limit: 10, status: statusFilter || undefined }),
        [page, statusFilter]
    );
    const [expandedRun, setExpandedRun] = useState(null);
    const [checks, setChecks] = useState(null);
    const [checksLoading, setChecksLoading] = useState(false);

    async function toggleChecks(runId) {
        if (expandedRun === runId) {
            setExpandedRun(null);
            setChecks(null);
            return;
        }
        setExpandedRun(runId);
        setChecksLoading(true);
        try {
            const result = await fetchRunChecks(runId);
            setChecks(result);
        } catch {
            setChecks([]);
        } finally {
            setChecksLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card glow-accent overflow-hidden"
        >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(140, 120, 200, 0.15)' }}>
                <h3 className="text-lg font-semibold text-metallic-silver">ETL Runs</h3>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="text-sm rounded-lg px-3 py-1.5 focus:outline-none transition-colors cursor-pointer"
                    style={{
                        background: 'rgba(30, 30, 60, 0.8)',
                        border: '1px solid rgba(140, 120, 200, 0.2)',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    <option value="">All statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="running">Running</option>
                </select>
            </div>

            {loading && <p className="text-[var(--color-text-secondary)] text-sm p-5 text-center">Loading runs...</p>}
            {error && <p className="text-[var(--color-error)] text-sm p-5 text-center">{error}</p>}

            {!loading && data && (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs uppercase" style={{ borderBottom: '1px solid rgba(140, 120, 200, 0.1)' }}>
                                    <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">ID</th>
                                    <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Job</th>
                                    <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
                                    <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Rows</th>
                                    <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Duration</th>
                                    <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Started</th>
                                    <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Checks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map((run) => (
                                    <motion.tr
                                        key={run.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="transition-colors"
                                        style={{ borderBottom: '1px solid rgba(140, 120, 200, 0.07)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(140, 120, 200, 0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td className="px-5 py-3 text-[var(--color-text-secondary)] font-mono">#{run.id}</td>
                                        <td className="px-5 py-3 text-[var(--color-text-secondary)]">{run.job_name}</td>
                                        <td className="px-5 py-3"><StatusBadge status={run.status} /></td>
                                        <td className="px-5 py-3 text-[var(--color-text-secondary)]">{run.rows_processed ?? '-'}</td>
                                        <td className="px-5 py-3 text-[var(--color-text-secondary)]">
                                            {run.duration_ms ? `${run.duration_ms}ms` : '-'}
                                        </td>
                                        <td className="px-5 py-3 text-[var(--color-text-muted)] text-xs">
                                            {new Date(run.start_time).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => toggleChecks(run.id)}
                                                className="text-[var(--color-accent)] hover:text-[var(--color-accent-dim)] text-xs transition-colors cursor-pointer"
                                            >
                                                {expandedRun === run.id ? 'Hide' : 'View'}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                                {data.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                                            No runs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {expandedRun && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-5"
                            style={{
                                borderTop: '1px solid rgba(140, 120, 200, 0.15)',
                                background: 'rgba(20, 20, 40, 0.4)',
                            }}
                        >
                            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                                Quality Checks for Run #{expandedRun}
                            </h4>
                            {checksLoading && <p className="text-[var(--color-text-muted)] text-xs">Loading...</p>}
                            {!checksLoading && checks && checks.length === 0 && (
                                <p className="text-[var(--color-text-muted)] text-xs">No checks recorded.</p>
                            )}
                            {!checksLoading && checks && checks.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {checks.map((check) => (
                                        <div
                                            key={check.id}
                                            className="rounded-lg p-3 text-xs"
                                            style={{
                                                background: check.passed ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)',
                                                border: `1px solid ${check.passed ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                                                color: check.passed ? 'var(--color-success)' : 'var(--color-error)',
                                            }}
                                        >
                                            <p className="font-medium mb-1">{check.check_name}</p>
                                            <p>Expected: {check.expected_value}</p>
                                            <p>Actual: {check.actual_value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {data.pagination.totalPages > 1 && (
                        <div
                            className="flex items-center justify-between p-5"
                            style={{ borderTop: '1px solid rgba(140, 120, 200, 0.15)' }}
                        >
                            <span className="text-xs text-[var(--color-text-muted)]">
                                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="px-3 py-1 text-xs rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    style={{
                                        background: 'rgba(140, 120, 200, 0.1)',
                                        border: '1px solid rgba(140, 120, 200, 0.2)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page >= data.pagination.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-3 py-1 text-xs rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    style={{
                                        background: 'rgba(140, 120, 200, 0.1)',
                                        border: '1px solid rgba(140, 120, 200, 0.2)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}

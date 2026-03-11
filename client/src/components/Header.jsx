import { useState } from 'react';
import { motion } from 'framer-motion';
import { triggerCryptoRun, fetchHealth } from '../lib/api';
import { useApi } from '../hooks/useApi';

export default function Header({ onPipelineComplete }) {
    const [running, setRunning] = useState(false);
    const [message, setMessage] = useState(null);
    const { data: health } = useApi(fetchHealth, []);

    async function handleTrigger() {
        setRunning(true);
        setMessage(null);
        try {
            const result = await triggerCryptoRun();
            setMessage({ type: 'success', text: `Pipeline completed: ${result.rowCount} rows in ${result.durationMs}ms` });
            onPipelineComplete?.();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setRunning(false);
        }
    }

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
            <div>
                <h1 className="text-2xl font-bold text-metallic">ETL Monitor</h1>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-[var(--color-text-secondary)]">Crypto Pipeline Dashboard</span>
                    {health && (
                        <span className={`inline-flex items-center gap-1.5 text-xs ${health.status === 'healthy' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${health.status === 'healthy' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}`}></span>
                            {health.status === 'healthy' ? 'DB Connected' : 'DB Disconnected'}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {message && (
                    <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-xs ${message.type === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}
                    >
                        {message.text}
                    </motion.span>
                )}
                <button
                    onClick={handleTrigger}
                    disabled={running}
                    className="px-6 py-2 text-sm font-semibold rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                    style={{
                        background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                        boxShadow: running ? 'none' : '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.15)',
                    }}
                >
                    {running ? 'Running...' : 'Run Pipeline'}
                </button>
            </div>
        </motion.header>
    );
}

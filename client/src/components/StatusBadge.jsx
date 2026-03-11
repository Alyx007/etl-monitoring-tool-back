import { motion } from 'framer-motion';

const styles = {
    success: {
        bg: 'rgba(74, 222, 128, 0.1)',
        border: 'rgba(74, 222, 128, 0.25)',
        text: 'var(--color-success)',
    },
    failed: {
        bg: 'rgba(248, 113, 113, 0.1)',
        border: 'rgba(248, 113, 113, 0.25)',
        text: 'var(--color-error)',
    },
    running: {
        bg: 'rgba(250, 204, 21, 0.1)',
        border: 'rgba(250, 204, 21, 0.25)',
        text: 'var(--color-warning)',
    },
};

const fallback = {
    bg: 'rgba(140, 120, 200, 0.1)',
    border: 'rgba(140, 120, 200, 0.25)',
    text: 'var(--color-text-secondary)',
};

export default function StatusBadge({ status }) {
    const s = styles[status] || fallback;
    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
        >
            {status === 'running' && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--color-warning)' }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--color-warning)' }}></span>
                </span>
            )}
            {status}
        </motion.span>
    );
}

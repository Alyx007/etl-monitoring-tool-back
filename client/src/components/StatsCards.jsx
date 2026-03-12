import { motion } from 'framer-motion';
import { timeAgo } from '../lib/timeAgo';

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function StatsCards({ runs }) {
    if (!runs) return null;

    const cards = [
        { label: 'Total Runs', value: runs.total_runs, color: 'var(--color-accent)' },
        { label: 'Successful', value: runs.successful_runs, color: 'var(--color-success)' },
        { label: 'Failed', value: runs.failed_runs, color: 'var(--color-error)' },
        {
            label: 'Last Run',
            value: timeAgo(runs.last_run_at),
            color: 'var(--color-text-secondary)',
            small: true,
        },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
            {cards.map((card) => (
                <motion.div
                    key={card.label}
                    variants={item}
                    className="glass-card glow-accent p-5"
                >
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">{card.label}</p>
                    <p
                        className={`${card.small ? 'text-sm' : 'text-2xl'} font-semibold`}
                        style={{ color: card.color }}
                    >
                        {card.value}
                    </p>
                </motion.div>
            ))}
        </motion.div>
    );
}

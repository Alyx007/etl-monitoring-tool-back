import { useApi } from '../hooks/useApi';
import { fetchPriceHistory } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-lg p-3 shadow-xl text-sm"
            style={{
                background: 'rgba(30, 30, 60, 0.95)',
                border: '1px solid rgba(140, 120, 200, 0.3)',
                backdropFilter: 'blur(12px)',
            }}
        >
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
            <p className="font-semibold text-[var(--color-text-primary)]">
                ${parseFloat(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </p>
        </div>
    );
}

export default function PriceChart({ coinId, onClose }) {
    const { data, loading, error } = useApi(
        () => fetchPriceHistory(coinId, 50),
        [coinId]
    );

    const chartData = data
        ? [...data].reverse().map((d) => ({
              time: new Date(d.fetched_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              }),
              price: parseFloat(d.price_usd),
          }))
        : [];

    const priceUp = chartData.length >= 2 && chartData[chartData.length - 1].price >= chartData[0].price;
    const strokeColor = priceUp ? '#a855f7' : '#e879f9';
    const fillId = `gradient-${coinId}`;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card glow-accent p-5"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-metallic-silver capitalize">
                        {coinId} Price History
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>

                {loading && <p className="text-[var(--color-text-secondary)] text-sm py-8 text-center">Loading chart...</p>}
                {error && <p className="text-[var(--color-error)] text-sm py-8 text-center">{error}</p>}
                {!loading && chartData.length === 0 && (
                    <p className="text-[var(--color-text-secondary)] text-sm py-8 text-center">No price history available yet.</p>
                )}

                {!loading && chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#c084fc" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#a855f7" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 200, 0.1)" />
                            <XAxis
                                dataKey="time"
                                tick={{ fill: '#6b6580', fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(140, 120, 200, 0.15)' }}
                            />
                            <YAxis
                                tick={{ fill: '#6b6580', fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(140, 120, 200, 0.15)' }}
                                domain={['auto', 'auto']}
                                tickFormatter={(v) => `$${v.toLocaleString()}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={strokeColor}
                                strokeWidth={2}
                                fill={`url(#${fillId})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

import { motion } from 'framer-motion';

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
};

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
}

function formatLargeNumber(num) {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
}

export default function PriceCards({ prices, onSelectCoin }) {
    if (!prices || prices.length === 0) return null;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
            {prices.map((coin) => {
                const change = parseFloat(coin.price_change_24h_pct);
                const changePositive = change >= 0;
                return (
                    <motion.div
                        key={coin.coin_id}
                        variants={item}
                        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                        onClick={() => onSelectCoin?.(coin.coin_id)}
                        className="glass-card p-5 cursor-pointer transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] capitalize">{coin.coin_id}</h3>
                            <span className="text-xs text-[var(--color-text-muted)] uppercase font-mono">{coin.symbol}</span>
                        </div>
                        <p className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                            {formatPrice(coin.price_usd)}
                        </p>
                        <div className="flex items-center justify-between">
                            <span
                                className="text-sm font-medium"
                                style={{ color: changePositive ? 'var(--color-success)' : 'var(--color-error)' }}
                            >
                                {changePositive ? '+' : ''}{change.toFixed(2)}%
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                                MCap {formatLargeNumber(coin.market_cap)}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

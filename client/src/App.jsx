import { useState, useCallback } from 'react';
import { fetchSummary } from './lib/api';
import { useApi } from './hooks/useApi';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import PriceCards from './components/PriceCards';
import PriceChart from './components/PriceChart';
import RunsTable from './components/RunsTable';

export default function App() {
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const { data: summary, loading, error } = useApi(
        () => fetchSummary(),
        [refreshKey]
    );

    const handlePipelineComplete = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 50%, #1a1a2e 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Header onPipelineComplete={handlePipelineComplete} />

                {loading && (
                    <p className="text-[var(--color-text-secondary)] text-center py-12">Loading dashboard...</p>
                )}

                {error && (
                    <div className="glass-card p-4 mb-6" style={{ borderColor: 'rgba(248, 113, 113, 0.3)' }}>
                        <p className="text-[var(--color-error)] text-sm">{error}</p>
                    </div>
                )}

                {summary && (
                    <div className="space-y-6">
                        <StatsCards runs={summary.runs} />

                        <div>
                            <h2 className="text-lg font-semibold text-metallic-silver mb-4">Latest Prices</h2>
                            <PriceCards
                                prices={summary.latestPrices}
                                onSelectCoin={(id) =>
                                    setSelectedCoin(selectedCoin === id ? null : id)
                                }
                            />
                        </div>

                        {selectedCoin && (
                            <PriceChart
                                coinId={selectedCoin}
                                onClose={() => setSelectedCoin(null)}
                            />
                        )}

                        <RunsTable key={refreshKey} />
                    </div>
                )}
            </div>
        </div>
    );
}

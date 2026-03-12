export function SkeletonCard({ className = '' }) {
    return (
        <div className={`glass-card p-5 animate-pulse ${className}`}>
            <div className="h-3 w-20 rounded-full mb-3" style={{ background: 'rgba(140, 120, 200, 0.15)' }} />
            <div className="h-7 w-28 rounded-full mb-2" style={{ background: 'rgba(140, 120, 200, 0.1)' }} />
            <div className="h-3 w-16 rounded-full" style={{ background: 'rgba(140, 120, 200, 0.08)' }} />
        </div>
    );
}

const ROW_WIDTHS = [45, 70, 55, 40, 60, 75, 50];

export function SkeletonRow() {
    return (
        <tr>
            {ROW_WIDTHS.map((w, i) => (
                <td key={i} className="px-5 py-3">
                    <div
                        className="h-4 rounded-full animate-pulse"
                        style={{
                            width: `${w}%`,
                            background: 'rgba(140, 120, 200, 0.1)',
                        }}
                    />
                </td>
            ))}
        </tr>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>

            <div>
                <div className="h-5 w-32 rounded-full mb-4 animate-pulse" style={{ background: 'rgba(140, 120, 200, 0.15)' }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(140, 120, 200, 0.15)' }}>
                    <div className="h-5 w-24 rounded-full animate-pulse" style={{ background: 'rgba(140, 120, 200, 0.15)' }} />
                    <div className="h-8 w-32 rounded-lg animate-pulse" style={{ background: 'rgba(140, 120, 200, 0.1)' }} />
                </div>
                <table className="w-full">
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonRow key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

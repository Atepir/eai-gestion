import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    data: { month: string; amount: number }[];
    title: string;
}

export function RevenueBarChart({ data, title }: Props) {
    const hasData = data.some((d) => d.amount > 0);

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
            {!hasData ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucun revenu enregistré</p>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                        />
                        <Tooltip
                            formatter={((value: any) => [`${Number(value).toLocaleString('fr-FR')} XOF`, 'Revenu']) as any}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        />
                        <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

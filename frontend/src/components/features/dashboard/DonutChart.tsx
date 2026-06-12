import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
    name: string;
    value: number;
    color: string;
}

interface Props {
    data: ChartData[];
    title: string;
    innerLabel?: string;
}

export function DonutChart({ data, title, innerLabel }: Props) {
    if (!data.length) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={((value: any, name: any) => [`${value} (${((Number(value) / total) * 100).toFixed(0)}%)`, name]) as any}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
            {innerLabel && (
                <div className="text-center -mt-16 relative z-10 pointer-events-none">
                    <span className="text-lg font-bold text-slate-700">{total}</span>
                    <span className="block text-xs text-slate-400">{innerLabel}</span>
                </div>
            )}
        </div>
    );
}

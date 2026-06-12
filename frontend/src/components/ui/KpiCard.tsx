import { ReactNode } from 'react';
import clsx from 'clsx';

interface KpiCardProps {
    label: string;
    value: number;
    icon: ReactNode;
    colorClass: string;
}

export function KpiCard({ label, value, icon, colorClass }: KpiCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
            <div className={clsx('flex h-12 w-12 items-center justify-center rounded-lg', colorClass)}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

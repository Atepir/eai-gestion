import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Receipt,
    AlertTriangle,
    Clock,
    Building2,
    ChevronRight,
} from 'lucide-react';
import { getDashboard } from '../api/dashboard.api';
import { KpiCard } from '../components/ui/KpiCard';
import { DonutChart } from '../components/features/dashboard/DonutChart';
import { RevenueBarChart } from '../components/features/dashboard/RevenueBarChart';
import clsx from 'clsx';

interface DashboardDto {
    unpaidInvoices: number;
    lateCount: number;
    noticesCount: number;
    vacantCount: number;
    urgentActions: {
        type: string;
        label: string;
        entityId: string;
        severity: 'high' | 'medium';
        dueDate?: string;
    }[];
    charts: {
        invoiceStatus: { name: string; value: number; color: string }[];
        occupancy: { name: string; value: number; color: string }[];
        monthlyRevenue: { month: string; amount: number }[];
    };
}

export function DashboardPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery<DashboardDto>({
        queryKey: ['dashboard'],
        queryFn: getDashboard,
        refetchInterval: 30000,
    });

    const kpis = [
        { label: 'Factures impayées', value: data?.unpaidInvoices ?? 0, icon: <Receipt className="h-6 w-6 text-white" />, colorClass: 'bg-red-500' },
        { label: 'En retard', value: data?.lateCount ?? 0, icon: <AlertTriangle className="h-6 w-6 text-white" />, colorClass: 'bg-orange-500' },
        { label: 'Préavis en cours', value: data?.noticesCount ?? 0, icon: <Clock className="h-6 w-6 text-white" />, colorClass: 'bg-amber-500' },
        { label: 'Biens vacants', value: data?.vacantCount ?? 0, icon: <Building2 className="h-6 w-6 text-white" />, colorClass: 'bg-blue-500' },
    ];

    if (isLoading) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
            <p className="mt-1 text-sm text-slate-500">Aperçu de votre gestion immobilière</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => (
                    <KpiCard key={kpi.label} {...kpi} />
                ))}
            </div>

            {data?.charts && (
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <DonutChart
                        data={data.charts.invoiceStatus}
                        title="Statut des factures"
                        innerLabel="Total"
                    />
                    <DonutChart
                        data={data.charts.occupancy}
                        title="Occupation des biens"
                        innerLabel="Biens"
                    />
                    <RevenueBarChart
                        data={data.charts.monthlyRevenue}
                        title="Revenus mensuels"
                    />
                </div>
            )}

            <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-800">Actions urgentes</h2>
                {data?.urgentActions && data.urgentActions.length > 0 ? (
                    <div className="mt-3 divide-y divide-slate-200 rounded-xl bg-white shadow-sm">
                        {data.urgentActions.map((action, idx) => (
                            <div
                                key={idx}
                                className="flex cursor-pointer items-center justify-between px-5 py-3 hover:bg-slate-50"
                                onClick={() => {
                                    if (action.type === 'late_invoice') navigate(`/invoices/${action.entityId}`);
                                    else if (action.type === 'expiring_contract') navigate(`/contracts/${action.entityId}`);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={clsx(
                                            'inline-flex h-2 w-2 rounded-full',
                                            action.severity === 'high' ? 'bg-red-500' : 'bg-amber-500',
                                        )}
                                    />
                                    <span className="text-sm text-slate-700">{action.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-3 rounded-xl bg-white p-8 text-center shadow-sm">
                        <p className="text-sm text-slate-500">Aucune action urgente ✓</p>
                    </div>
                )}
            </div>
        </div>
    );
}

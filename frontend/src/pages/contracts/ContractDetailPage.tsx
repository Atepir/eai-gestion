import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import apiClient from '../../api/client';

interface ContractDto {
    id: string;
    ownerId: string;
    propertyId: string;
    tenantId: string;
    monthlyRent: { amount: number; currency: string };
    startDate: string;
    endDate: string;
    status: string;
}

async function getContract(id: string): Promise<ContractDto> {
    const { data } = await apiClient.get(`/contracts/${id}`);
    return data;
}

const statusLabels: Record<string, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    ACTIVE: { variant: 'success', label: 'Actif' },
    NOTICE: { variant: 'warning', label: 'Préavis' },
    EXPIRED: { variant: 'danger', label: 'Expiré' },
    TERMINATED: { variant: 'neutral', label: 'Terminé' },
};

export function ContractDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: contract, isLoading } = useQuery({
        queryKey: ['contract', id],
        queryFn: () => getContract(id!),
        enabled: Boolean(id),
    });

    if (isLoading) return <div className="animate-pulse h-40 rounded-xl bg-slate-200" />;
    if (!contract) return <p>Contrat introuvable</p>;

    const status = statusLabels[contract.status] ?? { variant: 'neutral' as const, label: contract.status };

    return (
        <div>
            <PageHeader
                title={`Contrat ${contract.id.slice(0, 8)}`}
                action={
                    <Link
                        to={`/contracts/${contract.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <Pencil className="h-4 w-4" /> Modifier
                    </Link>
                }
            />
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <dl className="grid grid-cols-2 gap-4">
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Statut</dt>
                        <dd><StatusBadge variant={status.variant} label={status.label} /></dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Loyer mensuel</dt>
                        <dd className="text-sm font-semibold text-slate-900">
                            {contract.monthlyRent.amount.toLocaleString('fr-FR')} {contract.monthlyRent.currency}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Date de début</dt>
                        <dd className="text-sm text-slate-900">{new Date(contract.startDate).toLocaleDateString('fr-FR')}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Date de fin</dt>
                        <dd className="text-sm text-slate-900">{new Date(contract.endDate).toLocaleDateString('fr-FR')}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}


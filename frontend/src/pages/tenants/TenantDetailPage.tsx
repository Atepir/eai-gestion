import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { getTenant } from '../../api/tenants.api';
import { PageHeader } from '../../components/ui/PageHeader';

export function TenantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: tenant, isLoading } = useQuery({
        queryKey: ['tenant', id],
        queryFn: () => getTenant(id!),
        enabled: Boolean(id),
    });

    if (isLoading) return <div className="animate-pulse h-40 rounded-xl bg-slate-200" />;
    if (!tenant) return <p>Locataire introuvable</p>;

    return (
        <div>
            <PageHeader
                title={`${tenant.firstName} ${tenant.lastName}`}
                action={
                    <Link
                        to={`/tenants/${tenant.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <Pencil className="h-4 w-4" /> Modifier
                    </Link>
                }
            />
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <dl className="grid grid-cols-2 gap-4">
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Pièce d'identité</dt>
                        <dd className="text-sm text-slate-900">{tenant.idDocumentType}: {tenant.idDocumentNumber}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Téléphone</dt>
                        <dd className="text-sm text-slate-900">{tenant.phone ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Email</dt>
                        <dd className="text-sm text-slate-900">{tenant.email ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Profession</dt>
                        <dd className="text-sm text-slate-900">{tenant.profession ?? '—'}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

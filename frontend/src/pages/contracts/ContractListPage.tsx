import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Calendar, DollarSign, Home, User, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DonutChart } from '../../components/features/dashboard/DonutChart';
import { Drawer } from '../../components/ui/Drawer';
import { useToast } from '../../context/ToastContext';

// Temporary types until API is wired
import apiClient from '../../api/client';

interface ContractDto {
    id: string;
    ownerId: string;
    propertyId: string;
    tenantId: string;
    monthlyRent: { amount: number };
    startDate: string;
    endDate: string;
    status: string;
}

async function getContracts(): Promise<ContractDto[]> {
    const { data } = await apiClient.get('/contracts');
    return data;
}

const statusColors: Record<string, string> = {
    ACTIVE: '#059669', NOTICE: '#d97706', EXPIRED: '#dc2626', TERMINATED: '#94a3b8',
};

const statusLabels: Record<string, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    ACTIVE: { variant: 'success', label: 'Actif' },
    NOTICE: { variant: 'warning', label: 'Préavis' },
    EXPIRED: { variant: 'danger', label: 'Expiré' },
    TERMINATED: { variant: 'neutral', label: 'Terminé' },
};

const schema = z.object({
    propertyId: z.string().min(1, 'Requis'),
    tenantId: z.string().min(1, 'Requis'),
    monthlyRent: z.coerce.number().min(1, 'Requis'),
    startDate: z.string().min(1, 'Requis'),
    endDate: z.string().min(1, 'Requis'),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: 'La date de fin doit être après la date de début', path: ['endDate'],
});

type FormData = z.infer<typeof schema>;

export function ContractListPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<ContractDto | null>(null);
    const { data: contracts, isLoading } = useQuery({ queryKey: ['contracts'], queryFn: getContracts });

    // Fetch properties & tenants for form dropdowns and detail display
    const { data: properties } = useQuery<any[]>({ queryKey: ['properties'], queryFn: () => apiClient.get('/properties').then(r => r.data) });
    const { data: tenants } = useQuery<any[]>({ queryKey: ['tenants'], queryFn: () => apiClient.get('/tenants').then(r => r.data) });
    const vacantProperties = properties?.filter((p: any) => p.status === 'VACANT') ?? [];

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { monthlyRent: undefined as unknown as number },
    });

    const createMutation = useMutation({
        mutationFn: (data: FormData) => apiClient.post('/contracts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setDrawerOpen(false);
            reset();
            toast('success', 'Contrat créé avec succès.');
        },
        onError: () => toast('error', 'Erreur lors de la création du contrat.'),
    });

    const statusCounts: Record<string, number> = {};
    contracts?.forEach((c) => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });
    const contractStatusChart = Object.entries(statusCounts).map(([status, count]) => ({
        name: (statusLabels[status]?.label ?? status), value: count, color: statusColors[status] ?? '#94a3b8',
    }));

    const columns = [
        {
            key: 'propertyId', header: 'Bien',
            render: (c: ContractDto) => {
                const p = properties?.find((p: any) => p.id === c.propertyId);
                return <span className="font-medium">{p ? p.designation : c.propertyId.slice(0, 8) + '...'}</span>;
            },
        },
        {
            key: 'tenantId', header: 'Locataire',
            render: (c: ContractDto) => {
                const t = tenants?.find((t: any) => t.id === c.tenantId);
                return t ? `${t.firstName} ${t.lastName}` : c.tenantId.slice(0, 8) + '...';
            },
        },
        {
            key: 'monthlyRent', header: 'Loyer',
            render: (c: ContractDto) => {
                const amount = typeof c.monthlyRent === 'object' ? (c.monthlyRent as any).amount : c.monthlyRent;
                return `${Number(amount).toLocaleString('fr-FR')} XOF`;
            },
        },
        { key: 'startDate', header: 'Début', render: (c: ContractDto) => new Date(c.startDate).toLocaleDateString('fr-FR') },
        { key: 'endDate', header: 'Fin', render: (c: ContractDto) => new Date(c.endDate).toLocaleDateString('fr-FR') },
        {
            key: 'status', header: 'Statut',
            render: (c: ContractDto) => {
                const s = statusLabels[c.status] ?? { variant: 'neutral' as const, label: c.status };
                return <StatusBadge variant={s.variant} label={s.label} />;
            },
        },
    ];

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';
    const errorClass = 'mt-1 text-xs text-red-600';

    return (
        <div>
            <PageHeader title="Contrats"
                action={
                    <button onClick={() => setDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Plus className="h-4 w-4" /> Nouveau contrat
                    </button>
                }
            />
            {!isLoading && contracts && contracts.length > 0 && (
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DonutChart data={contractStatusChart} title="Répartition des contrats" innerLabel="Contrats" />
                </div>
            )}
            {!isLoading && (!contracts || contracts.length === 0) ? (
                <EmptyState title="Aucun contrat" message="Créez votre premier contrat" actionLabel="Nouveau contrat" actionHref="/contracts/new" icon={<FileText className="h-12 w-12" />} />
            ) : (
                <DataTable columns={columns} data={contracts ?? []} loading={isLoading} rowLink={(c) => { setSelectedContract(c); setDetailOpen(true); return ''; }} searchable searchPlaceholder="Rechercher un contrat..." />
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nouveau contrat">
                <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Bien</label>
                        <select {...register('propertyId')} className={inputClass}>
                            <option value="">Sélectionner un bien vacant...</option>
                            {vacantProperties.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.designation} — {p.address?.street}</option>
                            ))}
                        </select>
                        {errors.propertyId && <p className={errorClass}>{errors.propertyId.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Locataire</label>
                        <select {...register('tenantId')} className={inputClass}>
                            <option value="">Sélectionner un locataire...</option>
                            {tenants?.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                            ))}
                        </select>
                        {errors.tenantId && <p className={errorClass}>{errors.tenantId.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Loyer mensuel (XOF)</label>
                        <input type="number" {...register('monthlyRent')} className={inputClass} placeholder="Ex: 150000" />
                        {errors.monthlyRent && <p className={errorClass}>{errors.monthlyRent.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Date de début</label>
                            <input type="date" {...register('startDate')} className={inputClass} />
                            {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Date de fin</label>
                            <input type="date" {...register('endDate')} className={inputClass} />
                            {errors.endDate && <p className={errorClass}>{errors.endDate.message}</p>}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? 'Création...' : 'Créer le contrat'}
                        </button>
                        <button type="button" onClick={() => setDrawerOpen(false)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Annuler
                        </button>
                    </div>
                </form>
            </Drawer>

            <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedContract ? `Contrat ${selectedContract.id.slice(0, 8)}` : 'Détail'} size="md">
                {selectedContract && (() => {
                    const property = properties?.find((p: any) => p.id === selectedContract.propertyId);
                    const tenant = tenants?.find((t: any) => t.id === selectedContract.tenantId);
                    const amount = typeof selectedContract.monthlyRent === 'object' ? (selectedContract.monthlyRent as any).amount : selectedContract.monthlyRent;
                    return (
                        <div className="space-y-6">
                            {/* Status banner */}
                            <div className={`flex items-center gap-3 rounded-xl p-4 ${selectedContract.status === 'ACTIVE' ? 'bg-emerald-50' : selectedContract.status === 'NOTICE' ? 'bg-orange-50' : 'bg-slate-50'}`}>
                                <FileText className={`h-8 w-8 ${selectedContract.status === 'ACTIVE' ? 'text-emerald-600' : selectedContract.status === 'NOTICE' ? 'text-orange-600' : 'text-slate-400'}`} />
                                <div>
                                    <p className="font-semibold text-slate-900">Contrat {selectedContract.id.slice(0, 8)}</p>
                                    <StatusBadge variant={(statusLabels[selectedContract.status] ?? { variant: 'neutral' as const }).variant} label={(statusLabels[selectedContract.status] ?? { label: selectedContract.status }).label} />
                                </div>
                            </div>

                            <dl className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><DollarSign className="h-3 w-3" /> Loyer mensuel</dt>
                                    <dd className="text-lg font-bold text-slate-900">{Number(amount).toLocaleString('fr-FR')} XOF</dd>
                                </div>
                                <div>
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Calendar className="h-3 w-3" /> Date de début</dt>
                                    <dd className="text-sm text-slate-900">{new Date(selectedContract.startDate).toLocaleDateString('fr-FR')}</dd>
                                </div>
                                <div>
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Calendar className="h-3 w-3" /> Date de fin</dt>
                                    <dd className="text-sm text-slate-900">{new Date(selectedContract.endDate).toLocaleDateString('fr-FR')}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Home className="h-3 w-3" /> Bien</dt>
                                    <dd className="text-sm text-slate-900">{property ? `${property.designation} — ${property.address?.street}` : selectedContract.propertyId}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><User className="h-3 w-3" /> Locataire</dt>
                                    <dd className="text-sm text-slate-900">{tenant ? `${tenant.firstName} ${tenant.lastName}` : selectedContract.tenantId}</dd>
                                </div>
                            </dl>

                            {/* Actions */}
                            <div className="flex gap-2 border-t pt-4">
                                {selectedContract.status === 'ACTIVE' && (
                                    <>
                                        <button onClick={() => { setDetailOpen(false); toast('info', 'Fonctionnalité à venir.'); }}
                                            className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                                            <span className="flex items-center justify-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Résilier</span>
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setDetailOpen(false)}
                                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Fermer
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </Drawer>
        </div>
    );
}

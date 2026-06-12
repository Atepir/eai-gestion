import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Contact2, Phone, Mail, Briefcase, CreditCard, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getTenants, createTenant, type TenantDto } from '../../api/tenants.api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';

const schema = z.object({
    firstName: z.string().min(1, 'Requis'),
    lastName: z.string().min(1, 'Requis'),
    idDocumentType: z.string().min(1, 'Requis'),
    idDocumentNumber: z.string().min(1, 'Requis'),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    profession: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function TenantListPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<TenantDto | null>(null);
    const { data: tenants, isLoading } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const createMutation = useMutation({
        mutationFn: (data: FormData) => createTenant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setDrawerOpen(false);
            reset();
            toast('success', 'Locataire créé avec succès.');
        },
        onError: () => toast('error', 'Erreur lors de la création du locataire.'),
    });

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';
    const errorClass = 'mt-1 text-xs text-red-600';

    const columns = [
        {
            key: 'fullName', header: 'Nom',
            render: (t: TenantDto) => <span className="font-medium">{t.firstName} {t.lastName}</span>,
        },
        { key: 'phone', header: 'Téléphone' },
        { key: 'email', header: 'Email' },
        { key: 'profession', header: 'Profession' },
        { key: 'idDocumentType', header: 'Pièce', render: (t: TenantDto) => `${t.idDocumentType}: ${t.idDocumentNumber}` },
    ];

    if (!isLoading && (!tenants || tenants.length === 0)) {
        return (
            <div>
                <PageHeader title="Locataires" />
                <EmptyState title="Aucun locataire" message="Ajoutez votre premier locataire"
                    actionLabel="Nouveau locataire" actionHref="/tenants/new" icon={<Contact2 className="h-12 w-12" />} />
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Locataires"
                action={
                    <button onClick={() => setDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Plus className="h-4 w-4" /> Nouveau locataire
                    </button>
                }
            />
            <DataTable columns={columns} data={tenants ?? []} rowLink={(t) => { setSelectedTenant(t); setDetailOpen(true); return ''; }} loading={isLoading} searchable searchPlaceholder="Rechercher un locataire..." />

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nouveau locataire">
                <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Prénom</label>
                            <input {...register('firstName')} className={inputClass} />
                            {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nom</label>
                            <input {...register('lastName')} className={inputClass} />
                            {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Type pièce</label>
                        <input {...register('idDocumentType')} className={inputClass} placeholder="CNI, Passeport..." />
                        {errors.idDocumentType && <p className={errorClass}>{errors.idDocumentType.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">N° pièce</label>
                        <input {...register('idDocumentNumber')} className={inputClass} />
                        {errors.idDocumentNumber && <p className={errorClass}>{errors.idDocumentNumber.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                        <input {...register('phone')} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input {...register('email')} className={inputClass} />
                        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Profession</label>
                        <input {...register('profession')} className={inputClass} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? 'Création...' : 'Créer'}
                        </button>
                        <button type="button" onClick={() => setDrawerOpen(false)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Annuler
                        </button>
                    </div>
                </form>
            </Drawer>

            <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedTenant ? `${selectedTenant.firstName} ${selectedTenant.lastName}` : 'Détail'} size="md">
                {selectedTenant && (
                    <div className="space-y-6">
                        {/* Avatar banner */}
                        <div className="flex items-center gap-4 rounded-xl bg-indigo-50 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                                {selectedTenant.firstName[0]}{selectedTenant.lastName[0]}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-slate-900">{selectedTenant.firstName} {selectedTenant.lastName}</p>
                                <p className="text-sm text-slate-500">Locataire</p>
                            </div>
                        </div>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Phone className="h-3 w-3" /> Téléphone</dt>
                                <dd className="text-sm text-slate-900">{selectedTenant.phone ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Mail className="h-3 w-3" /> Email</dt>
                                <dd className="text-sm text-slate-900">{selectedTenant.email ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Briefcase className="h-3 w-3" /> Profession</dt>
                                <dd className="text-sm text-slate-900">{selectedTenant.profession ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Calendar className="h-3 w-3" /> Créé le</dt>
                                <dd className="text-sm text-slate-900">{new Date(selectedTenant.createdAt).toLocaleDateString('fr-FR')}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><CreditCard className="h-3 w-3" /> Pièce d'identité</dt>
                                <dd className="text-sm text-slate-900">{selectedTenant.idDocumentType}: {selectedTenant.idDocumentNumber}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-xs font-medium text-slate-500">ID</dt>
                                <dd className="text-xs font-mono text-slate-400 break-all">{selectedTenant.id}</dd>
                            </div>
                        </dl>
                        <div className="flex gap-2 border-t pt-4">
                            <button onClick={() => setDetailOpen(false)}
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}

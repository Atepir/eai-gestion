import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getOwners, createOwner, type OwnerDto } from '../../api/owners.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';

const schema = z.object({
    name: z.string().min(1, 'Requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function OwnerListPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState<OwnerDto | null>(null);

    const { data: owners, isLoading } = useQuery({
        queryKey: ['owners'],
        queryFn: getOwners,
        enabled: user?.role === 'ADMIN',
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const createMutation = useMutation({
        mutationFn: (data: FormData) => createOwner(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owners'] });
            setDrawerOpen(false);
            reset();
            toast('success', 'Propriétaire créé avec succès.');
        },
        onError: () => toast('error', 'Erreur lors de la création du propriétaire.'),
    });

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';
    const errorClass = 'mt-1 text-xs text-red-600';

    const columns = [
        { key: 'name', header: 'Nom', render: (o: OwnerDto) => <span className="font-medium">{o.name}</span> },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Téléphone' },
        { key: 'address', header: 'Adresse' },
    ];

    if (!isLoading && (!owners || owners.length === 0)) {
        return (
            <div>
                <PageHeader
                    title="Propriétaires"
                    action={
                        <button onClick={() => setDrawerOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Nouveau propriétaire
                        </button>
                    }
                />
                <EmptyState title="Aucun propriétaire" message="Ajoutez votre premier propriétaire"
                    actionLabel="Nouveau propriétaire" actionHref="" onAction={() => setDrawerOpen(true)}
                    icon={<Users className="h-12 w-12" />} />
                <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nouveau propriétaire">
                    <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nom complet</label>
                            <input {...register('name')} className={inputClass} placeholder="Ex: Jean Dupont" />
                            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input {...register('email')} className={inputClass} placeholder="Ex: jean@email.com" />
                            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                            <input {...register('phone')} className={inputClass} placeholder="Ex: +226 70 00 00 00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Adresse</label>
                            <input {...register('address')} className={inputClass} placeholder="Ex: Ouagadougou" />
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
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Propriétaires"
                action={
                    user?.role === 'ADMIN' ? (
                        <button onClick={() => setDrawerOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Nouveau propriétaire
                        </button>
                    ) : undefined
                }
            />
            <DataTable
                columns={columns}
                data={owners ?? []}
                loading={isLoading}
                rowLink={(o) => { setSelectedOwner(o); setDetailOpen(true); return ''; }}
                searchable
                searchPlaceholder="Rechercher un propriétaire..."
            />

            {/* Create drawer */}
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nouveau propriétaire">
                <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nom complet</label>
                        <input {...register('name')} className={inputClass} placeholder="Ex: Jean Dupont" />
                        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input {...register('email')} className={inputClass} placeholder="Ex: jean@email.com" />
                        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                        <input {...register('phone')} className={inputClass} placeholder="Ex: +226 70 00 00 00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Adresse</label>
                        <input {...register('address')} className={inputClass} placeholder="Ex: Ouagadougou" />
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

            {/* Detail drawer */}
            <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedOwner?.name ?? 'Détail'} size="md">
                {selectedOwner && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-slate-900">{selectedOwner.name}</p>
                                <p className="text-sm text-slate-500">Propriétaire</p>
                            </div>
                        </div>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Mail className="h-3 w-3" /> Email</dt>
                                <dd className="text-sm text-slate-900">{selectedOwner.email}</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Phone className="h-3 w-3" /> Téléphone</dt>
                                <dd className="text-sm text-slate-900">{selectedOwner.phone ?? '—'}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><MapPin className="h-3 w-3" /> Adresse</dt>
                                <dd className="text-sm text-slate-900">{selectedOwner.address ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Créé le</dt>
                                <dd className="text-sm text-slate-900">{new Date(selectedOwner.createdAt).toLocaleDateString('fr-FR')}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-xs font-medium text-slate-500">ID</dt>
                                <dd className="text-xs font-mono text-slate-400">{selectedOwner.id}</dd>
                            </div>
                        </dl>
                    </div>
                )}
            </Drawer>
        </div>
    );
}

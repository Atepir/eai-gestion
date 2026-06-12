import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, MapPin, Calendar, Home, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getProperties, createProperty, type PropertyDto } from '../../api/properties.api';
import { getOwners, type OwnerDto } from '../../api/owners.api';
import { useToast } from '../../context/ToastContext';
import { Drawer } from '../../components/ui/Drawer';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DonutChart } from '../../components/features/dashboard/DonutChart';

const typeLabels: Record<string, string> = {
    APARTMENT: 'Appartement',
    HOUSE: 'Maison',
    COMMERCIAL: 'Local commercial',
    LAND: 'Terrain',
};

const schema = z.object({
    designation: z.string().min(1, 'Requis'),
    street: z.string().min(1, 'Requis'),
    city: z.string().min(1, 'Requis'),
    zip: z.string().min(1, 'Requis'),
    type: z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND']),
});

type FormData = z.infer<typeof schema>;

export function PropertyListPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null);
    const { data: properties, isLoading } = useQuery({
        queryKey: ['properties'],
        queryFn: getProperties,
    });
    const { data: owners } = useQuery<OwnerDto[]>({
        queryKey: ['owners'],
        queryFn: getOwners,
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { type: 'APARTMENT' },
    });

    const createMutation = useMutation({
        mutationFn: (data: FormData) => createProperty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setDrawerOpen(false);
            reset();
            toast('success', 'Bien créé avec succès.');
        },
        onError: () => toast('error', 'Erreur lors de la création du bien.'),
    });

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';
    const errorClass = 'mt-1 text-xs text-red-600';

    const columns = [
        { key: 'designation', header: 'Désignation' },
        {
            key: 'type',
            header: 'Type',
            render: (p: PropertyDto) => typeLabels[p.type] ?? p.type,
        },
        {
            key: 'address',
            header: 'Adresse',
            render: (p: PropertyDto) => `${p.address.street}, ${p.address.zip} ${p.address.city}`,
        },
        {
            key: 'status',
            header: 'Statut',
            render: (p: PropertyDto) => (
                <StatusBadge
                    variant={p.status === 'OCCUPIED' ? 'info' : 'neutral'}
                    label={p.status === 'OCCUPIED' ? 'Occupé' : 'Vacant'}
                />
            ),
        },
    ];

    // Compute chart data
    const typeCounts: Record<string, number> = {};
    const typeColors: Record<string, string> = {
        APARTMENT: '#2563eb', HOUSE: '#059669', COMMERCIAL: '#d97706', LAND: '#7c3aed',
    };
    properties?.forEach((p) => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });
    const typeChart = Object.entries(typeCounts).map(([type, count]) => ({
        name: typeLabels[type] ?? type, value: count, color: typeColors[type] ?? '#94a3b8',
    }));

    const occupied = properties?.filter((p) => p.status === 'OCCUPIED').length ?? 0;
    const vacant = properties?.filter((p) => p.status === 'VACANT').length ?? 0;
    const occupancyChart = [
        { name: 'Occupés', value: occupied, color: '#2563eb' },
        { name: 'Vacants', value: vacant, color: '#94a3b8' },
    ];

    if (!isLoading && (!properties || properties.length === 0)) {
        return (
            <div>
                <PageHeader title="Biens" />
                <EmptyState
                    title="Aucun bien"
                    message="Ajoutez votre premier bien immobilier"
                    actionLabel="Nouveau bien"
                    actionHref="/properties/new"
                    icon={<Building2 className="h-12 w-12" />}
                />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Biens"
                action={
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau bien
                    </button>
                }
            />
            {properties && properties.length > 0 && (
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DonutChart data={typeChart} title="Types de biens" innerLabel="Biens" />
                    <DonutChart data={occupancyChart} title="Occupation" innerLabel="Biens" />
                </div>
            )}
            <DataTable
                columns={columns}
                data={properties ?? []}
                rowLink={(p) => { setSelectedProperty(p); setDetailOpen(true); return ''; }}
                loading={isLoading}
                searchable
                searchPlaceholder="Rechercher un bien..."
            />

            {/* Create drawer */}
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nouveau bien">
                <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Désignation</label>
                        <input {...register('designation')} className={inputClass} placeholder="Ex: Appartement 3B" />
                        {errors.designation && <p className={errorClass}>{errors.designation.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Rue</label>
                        <input {...register('street')} className={inputClass} />
                        {errors.street && <p className={errorClass}>{errors.street.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Ville</label>
                            <input {...register('city')} className={inputClass} />
                            {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Code postal</label>
                            <input {...register('zip')} className={inputClass} />
                            {errors.zip && <p className={errorClass}>{errors.zip.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Type</label>
                        <select {...register('type')} className={inputClass}>
                            {Object.entries(typeLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
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
            <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedProperty?.designation ?? 'Détail'} size="md">
                {selectedProperty && (() => {
                    const owner = owners?.find((o) => o.id === selectedProperty.ownerId);
                    return (
                        <div className="space-y-6">
                            {/* Status banner */}
                            <div className={`flex items-center gap-3 rounded-xl p-4 ${selectedProperty.status === 'OCCUPIED' ? 'bg-blue-50' : 'bg-slate-50'}`}>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedProperty.status === 'OCCUPIED' ? 'bg-blue-100' : 'bg-slate-200'}`}>
                                    <Home className={`h-5 w-5 ${selectedProperty.status === 'OCCUPIED' ? 'text-blue-600' : 'text-slate-500'}`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{selectedProperty.designation}</p>
                                    <StatusBadge variant={selectedProperty.status === 'OCCUPIED' ? 'info' : 'neutral'} label={selectedProperty.status === 'OCCUPIED' ? 'Occupé' : 'Vacant'} />
                                </div>
                            </div>

                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Building2 className="h-3 w-3" /> Type</dt>
                                    <dd className="text-sm text-slate-900">{typeLabels[selectedProperty.type]}</dd>
                                </div>
                                <div>
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Calendar className="h-3 w-3" /> Créé le</dt>
                                    <dd className="text-sm text-slate-900">{new Date(selectedProperty.createdAt).toLocaleDateString('fr-FR')}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><MapPin className="h-3 w-3" /> Adresse</dt>
                                    <dd className="text-sm text-slate-900">{selectedProperty.address.street}, {selectedProperty.address.zip} {selectedProperty.address.city}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><User className="h-3 w-3" /> Propriétaire</dt>
                                    <dd className="text-sm text-slate-900">{owner ? `${owner.name} (${owner.email})` : selectedProperty.ownerId.slice(0, 8) + '...'}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-xs font-medium text-slate-500">ID</dt>
                                    <dd className="text-xs font-mono text-slate-400 break-all">{selectedProperty.id}</dd>
                                </div>
                            </dl>

                            {/* Actions */}
                            <div className="flex gap-2 border-t pt-4">
                                {selectedProperty.status === 'VACANT' && (
                                    <button onClick={() => { setDetailOpen(false); setDrawerOpen(true); }}
                                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                        Créer un contrat
                                    </button>
                                )}
                                <button onClick={() => { setDetailOpen(false); }}
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

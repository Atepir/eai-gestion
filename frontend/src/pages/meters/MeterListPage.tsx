import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Gauge } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/client';

interface MeterDto {
    id: string; propertyId: string; type: 'WATER' | 'ELECTRICITY';
    entryReading: number | null; exitReading: number | null; consumption: number | null; status: string;
}

async function getMeters(): Promise<MeterDto[]> { const { data } = await apiClient.get('/meters'); return data; }

const typeLabels: Record<string, string> = { WATER: 'Eau (ONEA)', ELECTRICITY: 'Électricité (SONABEL)' };

export function MeterListPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [createOpen, setCreateOpen] = useState(false);
    const [readingsOpen, setReadingsOpen] = useState(false);
    const [selectedMeter, setSelectedMeter] = useState<MeterDto | null>(null);
    const [propertyId, setPropertyId] = useState('');
    const [meterType, setMeterType] = useState<'WATER' | 'ELECTRICITY'>('WATER');
    const [entryReading, setEntryReading] = useState('');
    const [exitReading, setExitReading] = useState('');

    const { data: meters, isLoading } = useQuery({ queryKey: ['meters'], queryFn: getMeters });
    const { data: properties } = useQuery<any[]>({ queryKey: ['properties'], queryFn: () => apiClient.get('/properties').then(r => r.data) });

    const createMutation = useMutation({
        mutationFn: () => apiClient.post('/meters', { propertyId, type: meterType }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meters'] });
            setCreateOpen(false);
            setPropertyId('');
            toast('success', 'Compteur créé avec succès.');
        },
        onError: () => toast('error', 'Erreur lors de la création du compteur.'),
    });

    const recordMutation = useMutation({
        mutationFn: () => apiClient.put(`/meters/${selectedMeter?.id}/readings`, { entryReading: Number(entryReading), exitReading: Number(exitReading) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meters'] });
            setReadingsOpen(false);
            toast('success', 'Relevé enregistré avec succès.');
        },
        onError: () => toast('error', 'Erreur lors de l\'enregistrement du relevé.'),
    });

    const openReadings = (m: MeterDto) => {
        setSelectedMeter(m);
        setEntryReading(m.entryReading?.toString() ?? '');
        setExitReading(m.exitReading?.toString() ?? '');
        setReadingsOpen(true);
    };

    const columns = [
        { key: 'type', header: 'Type', render: (m: MeterDto) => typeLabels[m.type] ?? m.type },
        { key: 'entryReading', header: 'Index entrée', render: (m: MeterDto) => m.entryReading ?? '—' },
        { key: 'exitReading', header: 'Index sortie', render: (m: MeterDto) => m.exitReading ?? '—' },
        { key: 'consumption', header: 'Conso.', render: (m: MeterDto) => m.consumption != null ? `${m.consumption}` : '—' },
        {
            key: 'status', header: 'Statut',
            render: (m: MeterDto) => {
                const labels: Record<string, { variant: 'warning' | 'success' | 'neutral'; label: string }> = {
                    PENDING: { variant: 'warning', label: 'À relever' }, READ: { variant: 'success', label: 'Relevé' }, TERMINATED: { variant: 'neutral', label: 'Résilié' },
                };
                const s = labels[m.status] ?? { variant: 'neutral' as const, label: m.status };
                return <StatusBadge variant={s.variant} label={s.label} />;
            },
        },
    ];

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';

    return (
        <div>
            <PageHeader title="Compteurs"
                action={
                    <button onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Plus className="h-4 w-4" /> Nouveau compteur
                    </button>
                }
            />

            {!isLoading && (!meters || meters.length === 0) ? (
                <EmptyState title="Aucun compteur" message="Ajoutez un compteur d'eau ou d'électricité" icon={<Gauge className="h-12 w-12" />} />
            ) : (
                <DataTable columns={columns} data={meters ?? []} loading={isLoading} rowLink={(m) => { openReadings(m); return ''; }} />
            )}

            {/* Create meter drawer */}
            <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau compteur">
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Bien</label>
                        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputClass}>
                            <option value="">Sélectionner un bien...</option>
                            {properties?.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.designation} — {p.address?.street}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Type</label>
                        <select value={meterType} onChange={(e) => setMeterType(e.target.value as any)} className={inputClass}>
                            <option value="WATER">Eau (ONEA)</option>
                            <option value="ELECTRICITY">Électricité (SONABEL)</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={createMutation.isPending || !propertyId}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            Créer
                        </button>
                        <button type="button" onClick={() => setCreateOpen(false)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Annuler
                        </button>
                    </div>
                </form>
            </Drawer>

            {/* Record readings drawer */}
            <Drawer open={readingsOpen} onClose={() => setReadingsOpen(false)} title={`Relevé — ${selectedMeter?.type === 'WATER' ? 'Eau' : 'Électricité'}`}>
                <form onSubmit={(e) => { e.preventDefault(); recordMutation.mutate(); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Index entrée</label>
                        <input type="number" value={entryReading} onChange={(e) => setEntryReading(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Index sortie</label>
                        <input type="number" value={exitReading} onChange={(e) => setExitReading(e.target.value)} className={inputClass} />
                    </div>
                    {Number(exitReading) > 0 && Number(entryReading) > 0 && (
                        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                            Consommation estimée : {Number(exitReading) - Number(entryReading)}
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={recordMutation.isPending}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            Enregistrer
                        </button>
                        <button type="button" onClick={() => setReadingsOpen(false)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Annuler
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    );
}

export function MeterReadingPage() { return <MeterListPage />; }


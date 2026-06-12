import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/client';

interface TerminationDto {
    id: string; contractId: string; noticeDate: string; endDate: string;
    status: string; remainingDays: number; checklistProgress: number;
    checklist?: { label: string; completed: boolean; orderIndex: number }[];
    depositRefunded?: boolean;
}

async function getTerminations(): Promise<TerminationDto[]> { const { data } = await apiClient.get('/terminations'); return data; }

export function TerminationListPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTermination, setSelectedTermination] = useState<TerminationDto | null>(null);
    const [contractId, setContractId] = useState('');
    const [depositAmount, setDepositAmount] = useState('');

    const { data: terminations, isLoading } = useQuery({ queryKey: ['terminations'], queryFn: getTerminations });
    const { data: contracts } = useQuery<any[]>({ queryKey: ['contracts'], queryFn: () => apiClient.get('/contracts').then(r => r.data) });
    const activeContracts = contracts?.filter((c: any) => c.status === 'ACTIVE') ?? [];

    const createMutation = useMutation({
        mutationFn: () => apiClient.post('/terminations', { contractId, depositAmount: depositAmount ? Number(depositAmount) : undefined }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terminations'] });
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setDrawerOpen(false); setContractId(''); setDepositAmount('');
            toast('success', 'Préavis lancé avec succès.');
        },
        onError: () => toast('error', 'Erreur lors du lancement du préavis.'),
    });

    const columns = [
        { key: 'contractId', header: 'Contrat', render: (t: TerminationDto) => t.contractId.slice(0, 8) },
        { key: 'noticeDate', header: 'Préavis', render: (t: TerminationDto) => new Date(t.noticeDate).toLocaleDateString('fr-FR') },
        { key: 'endDate', header: 'Fin prévue', render: (t: TerminationDto) => new Date(t.endDate).toLocaleDateString('fr-FR') },
        { key: 'remainingDays', header: 'Jours restants', render: (t: TerminationDto) => <span className={t.remainingDays <= 30 ? 'font-bold text-red-600' : 'text-slate-700'}>J-{t.remainingDays}</span> },
        { key: 'checklistProgress', header: 'Checklist', render: (t: TerminationDto) => <div className="flex items-center gap-2"><div className="h-2 w-20 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${t.checklistProgress}%` }} /></div><span className="text-xs text-slate-500">{t.checklistProgress}%</span></div> },
        { key: 'status', header: 'Statut', render: (t: TerminationDto) => <StatusBadge variant={t.status === 'COMPLETED' ? 'success' : 'warning'} label={t.status === 'COMPLETED' ? 'Clôturée' : 'En cours'} /> },
    ];

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';

    return (
        <div>
            <PageHeader title="Résiliations" action={<button onClick={() => setDrawerOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Nouvelle résiliation</button>} />
            {!isLoading && (!terminations || terminations.length === 0) ? (
                <EmptyState title="Aucune résiliation" message="Lancez un préavis de 3 mois depuis un contrat actif" icon={<AlertTriangle className="h-12 w-12" />} />
            ) : (
                <DataTable columns={columns} data={terminations ?? []} loading={isLoading} rowLink={(t) => { setSelectedTermination(t); setDetailOpen(true); return ''; }} />
            )}
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Lancer un préavis (3 mois)">
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
                    <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-700">Le préavis est de 3 mois. La date de fin sera calculée automatiquement.</div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Contrat actif</label>
                        <select value={contractId} onChange={(e) => setContractId(e.target.value)} className={inputClass}>
                            <option value="">Sélectionner un contrat actif...</option>
                            {activeContracts.map((c: any) => (
                                <option key={c.id} value={c.id}>Contrat {c.id.slice(0, 8)} — {Number(typeof c.monthlyRent === 'object' ? c.monthlyRent.amount : c.monthlyRent).toLocaleString('fr-FR')} XOF</option>
                            ))}
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700">Montant caution (optionnel)</label><input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className={inputClass} placeholder="Ex: 150000" /></div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={createMutation.isPending || !contractId} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">Lancer le préavis</button>
                        <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</button>
                    </div>
                </form>
            </Drawer>

            {/* Detail drawer */}
            <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title={`Résiliation ${selectedTermination?.contractId.slice(0, 8) ?? ''}`} size="md">
                {selectedTermination && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-4">
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                            <div>
                                <p className={`text-lg font-bold ${selectedTermination.remainingDays <= 30 ? 'text-red-600' : 'text-slate-900'}`}>J-{selectedTermination.remainingDays}</p>
                                <StatusBadge variant={selectedTermination.status === 'COMPLETED' ? 'success' : 'warning'} label={selectedTermination.status === 'COMPLETED' ? 'Clôturée' : 'En cours'} />
                            </div>
                        </div>
                        <dl className="grid grid-cols-2 gap-4">
                            <div><dt className="text-xs font-medium text-slate-500">Contrat</dt><dd className="text-sm font-mono text-slate-500">{selectedTermination.contractId.slice(0, 8)}</dd></div>
                            <div><dt className="text-xs font-medium text-slate-500">Checklist</dt><dd className="text-sm text-slate-900">{selectedTermination.checklistProgress}% complété</dd></div>
                            <div><dt className="text-xs font-medium text-slate-500">Date de préavis</dt><dd className="text-sm text-slate-900">{new Date(selectedTermination.noticeDate).toLocaleDateString('fr-FR')}</dd></div>
                            <div><dt className="text-xs font-medium text-slate-500">Date de fin</dt><dd className="text-sm text-slate-900">{new Date(selectedTermination.endDate).toLocaleDateString('fr-FR')}</dd></div>
                            {selectedTermination.depositRefunded !== undefined && (
                                <div className="col-span-2"><dt className="text-xs font-medium text-slate-500">Caution remboursée</dt><dd className="text-sm text-slate-900">{selectedTermination.depositRefunded ? '✅ Oui' : '❌ Non'}</dd></div>
                            )}
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

export function TerminationFormPage() { return <TerminationListPage />; }

export function TerminationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { data: terminations } = useQuery({ queryKey: ['terminations'], queryFn: getTerminations });
    const termination = terminations?.find((t: TerminationDto) => t.id === id);
    if (!termination) return <div className="p-8"><PageHeader title="Résiliation introuvable" /></div>;

    const completeMutation = useMutation({ mutationFn: (itemIdx: number) => apiClient.put(`/terminations/${id}`, { checklist: termination?.checklist?.map((item: any, i: number) => ({ ...item, completed: i === itemIdx ? !item.completed : item.completed })) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['terminations'] }) });
    const depositMutation = useMutation({ mutationFn: () => apiClient.put(`/terminations/${id}`, { depositRefunded: true, checklist: termination?.checklist }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['terminations'] }) });
    const closeMutation = useMutation({ mutationFn: () => apiClient.post(`/terminations/${id}/close`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['terminations'] }); queryClient.invalidateQueries({ queryKey: ['contracts'] }); queryClient.invalidateQueries({ queryKey: ['properties'] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); } });

    return (
        <div>
            <PageHeader title={`Résiliation ${termination.id.slice(0, 8)}`} />
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4">
                        <div><dt className="text-xs font-medium text-slate-500">Contrat</dt><dd className="text-sm text-slate-900">{termination.contractId.slice(0, 8)}</dd></div>
                        <div><dt className="text-xs font-medium text-slate-500">Jours restants</dt><dd className={`text-lg font-bold ${termination.remainingDays <= 30 ? 'text-red-600' : 'text-slate-900'}`}>J-{termination.remainingDays}</dd></div>
                        <div><dt className="text-xs font-medium text-slate-500">Date de préavis</dt><dd className="text-sm text-slate-900">{new Date(termination.noticeDate).toLocaleDateString('fr-FR')}</dd></div>
                        <div><dt className="text-xs font-medium text-slate-500">Date de fin</dt><dd className="text-sm text-slate-900">{new Date(termination.endDate).toLocaleDateString('fr-FR')}</dd></div>
                    </dl>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold mb-3">Checklist de sortie</h3>
                    <div className="h-2 w-full rounded-full bg-slate-200 mb-4"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${termination.checklistProgress}%` }} /></div>
                    <div className="space-y-2">
                        {termination.checklist?.map((item: any, idx: number) => (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                <input type="checkbox" checked={item.completed} onChange={() => completeMutation.mutate(idx)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.label}</span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2 border-t pt-4">
                        <label className="flex items-center gap-3"><input type="checkbox" checked={termination.depositRefunded} onChange={() => depositMutation.mutate()} className="h-4 w-4 rounded border-slate-300 text-emerald-600" /><span className="text-sm font-medium text-slate-700">Caution remboursée</span></label>
                        <button onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending || termination.checklistProgress < 100 || !termination.depositRefunded} className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">{closeMutation.isPending ? 'Clôture...' : 'Clôturer la résiliation'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

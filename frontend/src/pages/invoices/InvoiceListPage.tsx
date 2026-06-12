import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Receipt, RefreshCw, CreditCard, Calendar, DollarSign, FileText } from 'lucide-react';
import { getInvoices, generateInvoices } from '../../api/invoices.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';
import { DonutChart } from '../../components/features/dashboard/DonutChart';
import { RevenueBarChart } from '../../components/features/dashboard/RevenueBarChart';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/client';

interface InvoiceDto {
    id: string;
    contractId: string;
    periodLabel: string;
    amount: { amount: number; currency: string };
    dueDate: string;
    status: string;
    createdAt?: string;
}

export function InvoiceListPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
    const { data: invoices, isLoading } = useQuery<InvoiceDto[]>({
        queryKey: ['invoices'],
        queryFn: getInvoices,
    });

    // Payment form state for detail drawer
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentRef, setPaymentRef] = useState('');
    const [payingInvoice, setPayingInvoice] = useState(false);

    const recordPaymentMutation = useMutation({
        mutationFn: (invoiceId: string) => apiClient.post('/payments', {
            invoiceId,
            amount: selectedInvoice?.amount.amount,
            method: paymentMethod,
            paymentDate: new Date().toISOString().split('T')[0],
            reference: paymentRef || undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setPayingInvoice(false);
            setPaymentRef('');
            toast('success', 'Paiement enregistré avec succès.');
        },
        onError: () => toast('error', 'Erreur lors de l\'enregistrement du paiement.'),
    });

    const generateMutation = useMutation({
        mutationFn: generateInvoices,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast('success', `${result.generated} facture(s) générée(s).`);
        },
        onError: () => toast('error', 'Erreur lors de la génération des factures.'),
    });

    // Compute chart data from invoices
    const paid = invoices?.filter((i) => i.status === 'PAID').length ?? 0;
    const unpaid = invoices?.filter((i) => i.status === 'UNPAID' && new Date(i.dueDate) >= new Date()).length ?? 0;
    const late = invoices?.filter((i) => i.status === 'UNPAID' && new Date(i.dueDate) < new Date()).length ?? 0;

    const invoiceStatusChart = [
        { name: 'Payées', value: paid, color: '#059669' },
        { name: 'Impayées', value: unpaid, color: '#d97706' },
        { name: 'En retard', value: late, color: '#dc2626' },
    ].filter((c) => c.value > 0);

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const revenueByMonth: Record<string, number> = {};
    invoices?.filter((i) => i.status === 'PAID').forEach((inv) => {
        const d = new Date(inv.createdAt || new Date());
        const key = months[d.getMonth()] + ' ' + d.getFullYear();
        revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(inv.amount.amount);
    });
    const monthlyRevenue: { month: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = months[d.getMonth()] + ' ' + d.getFullYear();
        monthlyRevenue.push({ month: key, amount: revenueByMonth[key] || 0 });
    }

    const columns = [
        { key: 'periodLabel', header: 'Période', render: (i: InvoiceDto) => <span className="font-medium">{i.periodLabel}</span> },
        { key: 'contractId', header: 'Contrat', render: (i: InvoiceDto) => i.contractId.slice(0, 8) + '...' },
        {
            key: 'amount',
            header: 'Montant',
            render: (i: InvoiceDto) => `${i.amount.amount.toLocaleString('fr-FR')} ${i.amount.currency}`,
        },
        {
            key: 'dueDate',
            header: 'Échéance',
            render: (i: InvoiceDto) => {
                const d = new Date(i.dueDate);
                const isOverdue = i.status === 'UNPAID' && d < new Date();
                return (
                    <span className={isOverdue ? 'font-semibold text-red-600' : ''}>
                        {d.toLocaleDateString('fr-FR')}
                    </span>
                );
            },
        },
        {
            key: 'status',
            header: 'Statut',
            render: (i: InvoiceDto) => {
                const d = new Date(i.dueDate);
                if (i.status === 'PAID') return <StatusBadge variant="success" label="Payée" />;
                if (d < new Date()) return <StatusBadge variant="danger" label="En retard" />;
                return <StatusBadge variant="warning" label="Non payée" />;
            },
        },
    ];

    return (
        <div>
            <PageHeader
                title="Factures"
                action={
                    <button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                        Générer les factures
                    </button>
                }
            />
            {!isLoading && invoices && invoices.length > 0 && (
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DonutChart data={invoiceStatusChart} title="Statut des factures" innerLabel="Total" />
                    <RevenueBarChart data={monthlyRevenue} title="Revenus mensuels" />
                </div>
            )}
            {!isLoading && (!invoices || invoices.length === 0) ? (
                <EmptyState
                    title="Aucune facture"
                    message="Cliquez sur 'Générer les factures' pour créer les factures trimestrielles."
                    icon={<Receipt className="h-12 w-12" />}
                />
            ) : (
                <DataTable columns={columns} data={invoices ?? []} loading={isLoading} rowLink={(i) => { setSelectedInvoice(i); setDetailOpen(true); return ''; }} searchable searchPlaceholder="Rechercher une facture..." />
            )}

            <Drawer open={detailOpen} onClose={() => { setDetailOpen(false); setPayingInvoice(false); }} title={selectedInvoice ? `Facture ${selectedInvoice.periodLabel}` : 'Détail'} size="md">
                {selectedInvoice && (() => {
                    const isOverdue = selectedInvoice.status === 'UNPAID' && new Date(selectedInvoice.dueDate) < new Date();
                    return (
                        <div className="space-y-6">
                            {/* Status banner */}
                            <div className={`flex items-center gap-3 rounded-xl p-4 ${selectedInvoice.status === 'PAID' ? 'bg-emerald-50' : isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                                <Receipt className={`h-8 w-8 ${selectedInvoice.status === 'PAID' ? 'text-emerald-600' : isOverdue ? 'text-red-600' : 'text-amber-600'}`} />
                                <div>
                                    <p className="font-semibold text-slate-900">{selectedInvoice.periodLabel}</p>
                                    {selectedInvoice.status === 'PAID' ? <StatusBadge variant="success" label="Payée" /> : isOverdue ? <StatusBadge variant="danger" label="En retard" /> : <StatusBadge variant="warning" label="Non payée" />}
                                </div>
                            </div>

                            <dl className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><DollarSign className="h-3 w-3" /> Montant</dt>
                                    <dd className="text-lg font-bold text-slate-900">{selectedInvoice.amount.amount.toLocaleString('fr-FR')} {selectedInvoice.amount.currency}</dd>
                                </div>
                                <div>
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Calendar className="h-3 w-3" /> Échéance</dt>
                                    <dd className={`text-sm ${isOverdue ? 'font-semibold text-red-600' : 'text-slate-900'}`}>{new Date(selectedInvoice.dueDate).toLocaleDateString('fr-FR')}</dd>
                                </div>
                                <div>
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><FileText className="h-3 w-3" /> Contrat</dt>
                                    <dd className="text-sm font-mono text-slate-500">{selectedInvoice.contractId.slice(0, 8)}...</dd>
                                </div>
                            </dl>

                            {/* Record payment */}
                            {selectedInvoice.status !== 'PAID' && (
                                <div className="border-t pt-4">
                                    {!payingInvoice ? (
                                        <button onClick={() => setPayingInvoice(true)}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
                                            <CreditCard className="h-4 w-4" /> Enregistrer un paiement
                                        </button>
                                    ) : (
                                        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm font-medium text-slate-700">Enregistrer un paiement de {selectedInvoice.amount.amount.toLocaleString('fr-FR')} XOF</p>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Mode de paiement</label>
                                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                                    <option value="CASH">Espèces</option>
                                                    <option value="CHECK">Chèque</option>
                                                    <option value="TRANSFER">Virement</option>
                                                    <option value="MOBILE_MONEY">Mobile Money</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Référence (optionnel)</label>
                                                <input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                    placeholder="N° chèque, ID transaction..." />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => recordPaymentMutation.mutate(selectedInvoice.id)}
                                                    disabled={recordPaymentMutation.isPending}
                                                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                                                    {recordPaymentMutation.isPending ? 'Enregistrement...' : 'Confirmer le paiement'}
                                                </button>
                                                <button onClick={() => setPayingInvoice(false)}
                                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 border-t pt-4">
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

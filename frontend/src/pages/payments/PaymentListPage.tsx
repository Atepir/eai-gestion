import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard, Calendar, DollarSign, FileText, Tag } from 'lucide-react';
import { useState } from 'react';
import { getPayments, recordPayment } from '../../api/payments.api';
import { getInvoices } from '../../api/invoices.api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';

const methodLabels: Record<string, string> = {
    CASH: 'Espèces', CHECK: 'Chèque', TRANSFER: 'Virement', MOBILE_MONEY: 'Mobile Money',
};

interface PaymentDto {
    id: string;
    invoiceId: string;
    amount: { amount: number; currency: string };
    method: string;
    paymentDate: string;
    reference: string | null;
}

export function PaymentListPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentDto | null>(null);
    const { data: payments, isLoading } = useQuery({ queryKey: ['payments'], queryFn: getPayments });

    // Form state
    const [invoiceId, setInvoiceId] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [reference, setReference] = useState('');

    const { data: invoices } = useQuery<any[]>({ queryKey: ['invoices'], queryFn: getInvoices });
    const unpaidInvoices = (invoices ?? []).filter((i: any) => i.status === 'UNPAID');

    const createMutation = useMutation({
        mutationFn: () => recordPayment({ invoiceId, amount: Number(amount), method, paymentDate, reference: reference || undefined }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setDrawerOpen(false);
            toast('success', 'Paiement enregistré avec succès.');
        },
        onError: () => toast('error', 'Erreur lors de l\'enregistrement du paiement.'),
    });

    const columns = [
        { key: 'paymentDate', header: 'Date', render: (p: PaymentDto) => new Date(p.paymentDate).toLocaleDateString('fr-FR') },
        { key: 'invoiceId', header: 'Facture', render: (p: PaymentDto) => p.invoiceId.slice(0, 8) + '...' },
        { key: 'amount', header: 'Montant', render: (p: PaymentDto) => `${p.amount.amount.toLocaleString('fr-FR')} ${p.amount.currency}` },
        { key: 'method', header: 'Mode', render: (p: PaymentDto) => methodLabels[p.method] ?? p.method },
        { key: 'reference', header: 'Référence' },
    ];

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';

    return (
        <div>
            <PageHeader title="Paiements"
                action={
                    <button onClick={() => setDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Plus className="h-4 w-4" /> Nouveau paiement
                    </button>
                }
            />
            {!isLoading && (!payments || payments.length === 0) ? (
                <EmptyState title="Aucun paiement" message="Enregistrez un paiement depuis une facture" icon={<CreditCard className="h-12 w-12" />} />
            ) : (
                <DataTable columns={columns} data={payments ?? []} loading={isLoading} rowLink={(p) => { setSelectedPayment(p); setDetailOpen(true); return ''; }} />
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nouveau paiement">
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Facture</label>
                        <select value={invoiceId} onChange={(e) => {
                            setInvoiceId(e.target.value);
                            const inv = unpaidInvoices.find((i: any) => i.id === e.target.value);
                            if (inv) setAmount(String(inv.amount.amount));
                        }} className={inputClass}>
                            <option value="">Sélectionner une facture impayée...</option>
                            {unpaidInvoices.map((inv: any) => (
                                <option key={inv.id} value={inv.id}>{inv.periodLabel} — {inv.amount.amount.toLocaleString('fr-FR')} XOF</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Montant (XOF)</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Mode de paiement</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
                            <option value="CASH">Espèces</option>
                            <option value="CHECK">Chèque</option>
                            <option value="TRANSFER">Virement</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Date de paiement</label>
                        <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Référence (optionnel)</label>
                        <input value={reference} onChange={(e) => setReference(e.target.value)} className={inputClass} placeholder="N° chèque, ID transaction..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={createMutation.isPending || !invoiceId || !amount}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button type="button" onClick={() => setDrawerOpen(false)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Annuler
                        </button>
                    </div>
                </form>
            </Drawer>

            {/* Detail drawer */}
            <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title="Détail du paiement" size="md">
                {selectedPayment && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 rounded-xl bg-emerald-50 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <CreditCard className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-slate-900">{selectedPayment.amount.amount.toLocaleString('fr-FR')} {selectedPayment.amount.currency}</p>
                                <p className="text-sm text-slate-500">Paiement enregistré</p>
                            </div>
                        </div>

                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Calendar className="h-3 w-3" /> Date</dt>
                                <dd className="text-sm text-slate-900">{new Date(selectedPayment.paymentDate).toLocaleDateString('fr-FR')}</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Tag className="h-3 w-3" /> Mode</dt>
                                <dd className="text-sm text-slate-900">{methodLabels[selectedPayment.method] ?? selectedPayment.method}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><FileText className="h-3 w-3" /> Facture</dt>
                                <dd className="text-sm font-mono text-slate-500">{selectedPayment.invoiceId}</dd>
                            </div>
                            {selectedPayment.reference && (
                                <div className="col-span-2">
                                    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><DollarSign className="h-3 w-3" /> Référence</dt>
                                    <dd className="text-sm text-slate-900">{selectedPayment.reference}</dd>
                                </div>
                            )}
                            <div className="col-span-2">
                                <dt className="text-xs font-medium text-slate-500">ID</dt>
                                <dd className="text-xs font-mono text-slate-400 break-all">{selectedPayment.id}</dd>
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

export function PaymentFormPage() {
    return <PaymentListPage />;
}

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileDown } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import apiClient from '../../api/client';

interface InvoiceDto {
    id: string;
    contractId: string;
    periodLabel: string;
    amount: { amount: number; currency: string };
    dueDate: string;
    status: string;
    createdAt: string;
}

async function getInvoice(id: string): Promise<InvoiceDto> {
    const { data } = await apiClient.get(`/invoices/${id}`);
    return data;
}

export function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: invoice, isLoading } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => getInvoice(id!),
        enabled: Boolean(id),
    });

    if (isLoading) return <div className="animate-pulse h-40 rounded-xl bg-slate-200" />;
    if (!invoice) return <p>Facture introuvable</p>;

    const isOverdue = invoice.status === 'UNPAID' && new Date(invoice.dueDate) < new Date();

    return (
        <div>
            <PageHeader
                title={`Facture ${invoice.periodLabel}`}
                action={
                    <button className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <FileDown className="h-4 w-4" /> Exporter PDF
                    </button>
                }
            />
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <dl className="grid grid-cols-2 gap-4">
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Période</dt>
                        <dd className="text-sm font-semibold text-slate-900">{invoice.periodLabel}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Statut</dt>
                        <dd>
                            {invoice.status === 'PAID' ? (
                                <StatusBadge variant="success" label="Payée" />
                            ) : isOverdue ? (
                                <StatusBadge variant="danger" label="En retard" />
                            ) : (
                                <StatusBadge variant="warning" label="Non payée" />
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Montant</dt>
                        <dd className="text-lg font-bold text-slate-900">
                            {invoice.amount.amount.toLocaleString('fr-FR')} {invoice.amount.currency}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Échéance</dt>
                        <dd className={`text-sm ${isOverdue ? 'font-semibold text-red-600' : 'text-slate-900'}`}>
                            {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Créée le</dt>
                        <dd className="text-sm text-slate-500">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}


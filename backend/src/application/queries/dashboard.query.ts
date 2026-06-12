import { Injectable, Inject } from '@nestjs/common';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '../../domain/ports/invoice.repository.port';
import { ContractRepositoryPort, CONTRACT_REPOSITORY } from '../../domain/ports/contract.repository.port';
import { PropertyRepositoryPort, PROPERTY_REPOSITORY } from '../../domain/ports/property.repository.port';

export interface DashboardDto {
    unpaidInvoices: number;
    lateCount: number;
    noticesCount: number;
    vacantCount: number;
    urgentActions: UrgentAction[];
    charts: DashboardCharts;
}

export interface DashboardCharts {
    invoiceStatus: { name: string; value: number; color: string }[];
    occupancy: { name: string; value: number; color: string }[];
    monthlyRevenue: { month: string; amount: number }[];
}

export interface UrgentAction {
    type: 'late_invoice' | 'expiring_contract' | 'incomplete_checklist';
    label: string;
    entityId: string;
    severity: 'high' | 'medium';
    dueDate?: string;
}

@Injectable()
export class DashboardQuery {
    constructor(
        @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort,
        @Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepositoryPort,
        @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: PropertyRepositoryPort,
    ) { }

    async execute(ownerId?: string): Promise<DashboardDto> {
        const now = new Date();

        const allInvoices = ownerId
            ? await this.invoiceRepo.findByOwnerId(ownerId)
            : await this.invoiceRepo.findAll();

        const unpaidInvoices = allInvoices.filter((i) => i.status === 'UNPAID');
        const lateInvoices = unpaidInvoices.filter((i) => i.dueDate < now);
        const paidInvoices = allInvoices.filter((i) => i.status === 'PAID');

        const properties = ownerId
            ? await this.propertyRepo.findByOwnerId(ownerId)
            : await this.propertyRepo.findAll();

        const vacantCount = properties.filter((p) => p.status === 'VACANT').length;
        const occupiedCount = properties.filter((p) => p.status === 'OCCUPIED').length;

        const activeContracts = await this.contractRepo.findActiveAndNotice();
        const ownerContracts = ownerId
            ? activeContracts.filter((c) => c.ownerId === ownerId)
            : activeContracts;

        const noticesCount = ownerContracts.filter((c) => c.status === 'NOTICE').length;

        const urgentActions: UrgentAction[] = [
            ...lateInvoices.slice(0, 5).map((inv) => ({
                type: 'late_invoice' as const,
                label: `Facture ${inv.periodLabel} — ${inv.amount.toString()} — impayée`,
                entityId: inv.id,
                severity: 'high' as const,
                dueDate: inv.dueDate.toISOString(),
            })),
            ...ownerContracts
                .filter((c) => {
                    const daysLeft = Math.ceil((c.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return daysLeft <= 30 && daysLeft > 0;
                })
                .slice(0, 5)
                .map((c) => ({
                    type: 'expiring_contract' as const,
                    label: `Contrat expire dans ${Math.ceil((c.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} jours`,
                    entityId: c.id,
                    severity: 'medium' as const,
                    dueDate: c.endDate.toISOString(),
                })),
        ].sort((a, b) => (a.severity === 'high' ? -1 : 1));

        return {
            unpaidInvoices: unpaidInvoices.length,
            lateCount: lateInvoices.length,
            noticesCount,
            vacantCount,
            urgentActions: urgentActions.slice(0, 10),
            charts: {
                invoiceStatus: [
                    { name: 'Payées', value: paidInvoices.length, color: '#059669' },
                    { name: 'Impayées', value: unpaidInvoices.length - lateInvoices.length, color: '#d97706' },
                    { name: 'En retard', value: lateInvoices.length, color: '#dc2626' },
                ].filter((c) => c.value > 0),
                occupancy: [
                    { name: 'Occupés', value: occupiedCount, color: '#2563eb' },
                    { name: 'Vacants', value: vacantCount, color: '#94a3b8' },
                ],
                monthlyRevenue: this.buildMonthlyRevenue(allInvoices),
            },
        };
    }

    private buildMonthlyRevenue(invoices: any[]): { month: string; amount: number }[] {
        const paidInvoices = invoices.filter((i) => i.status === 'PAID');
        const byMonth: Record<string, number> = {};
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        for (const inv of paidInvoices) {
            const d = new Date(inv.createdAt);
            const key = months[d.getMonth()] + ' ' + d.getFullYear();
            byMonth[key] = (byMonth[key] || 0) + Number(inv.amount.amount);
        }

        // Return last 6 months including empty months
        const result: { month: string; amount: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = months[d.getMonth()] + ' ' + d.getFullYear();
            result.push({ month: key, amount: byMonth[key] || 0 });
        }
        return result;
    }
}
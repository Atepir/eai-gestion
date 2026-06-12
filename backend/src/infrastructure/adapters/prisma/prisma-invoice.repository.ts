import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { InvoiceRepositoryPort } from '../../../domain/ports/invoice.repository.port';
import type { InvoiceStatus } from '../../../domain/entities/invoice.entity';

@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Invoice | null> {
        const row = await this.prisma.invoice.findUnique({ where: { id } });
        return row ? this.toDomain(row) : null;
    }

    async findAll(): Promise<Invoice[]> {
        const rows = await this.prisma.invoice.findMany();
        return rows.map((r) => this.toDomain(r));
    }

    async findByContractId(contractId: string): Promise<Invoice[]> {
        const rows = await this.prisma.invoice.findMany({ where: { contractId } });
        return rows.map((r) => this.toDomain(r));
    }

    async findByOwnerId(ownerId: string): Promise<Invoice[]> {
        const rows = await this.prisma.invoice.findMany({ where: { ownerId } });
        return rows.map((r) => this.toDomain(r));
    }

    async findUnpaidByContractAndPeriod(contractId: string, periodLabel: string): Promise<Invoice | null> {
        const row = await this.prisma.invoice.findFirst({
            where: { contractId, periodLabel, status: 'UNPAID' },
        });
        return row ? this.toDomain(row) : null;
    }

    async findUnpaidPastDue(now: Date): Promise<Invoice[]> {
        const rows = await this.prisma.invoice.findMany({
            where: { status: 'UNPAID', dueDate: { lt: now } },
            orderBy: { dueDate: 'asc' },
        });
        return rows.map((r) => this.toDomain(r));
    }

    async create(invoice: Invoice): Promise<Invoice> {
        const row = await this.prisma.invoice.create({
            data: {
                id: invoice.id,
                contractId: invoice.contractId,
                ownerId: invoice.ownerId,
                periodLabel: invoice.periodLabel,
                amount: invoice.amount.amount,
                dueDate: invoice.dueDate,
                status: invoice.status as any,
            },
        });
        return this.toDomain(row);
    }

    async update(invoice: Invoice): Promise<Invoice> {
        const row = await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: invoice.status as any },
        });
        return this.toDomain(row);
    }

    private toDomain(row: { id: string; contractId: string; ownerId: string; periodLabel: string; amount: any; dueDate: Date; status: string; createdAt: Date }): Invoice {
        return Invoice.reconstitute({
            id: row.id, contractId: row.contractId, ownerId: row.ownerId,
            periodLabel: row.periodLabel, amount: Money.fromDecimal(Number(row.amount)),
            dueDate: row.dueDate, status: row.status as InvoiceStatus, createdAt: row.createdAt,
        });
    }
}

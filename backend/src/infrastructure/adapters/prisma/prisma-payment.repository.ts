import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Payment } from '../../../domain/entities/payment.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { PaymentRepositoryPort } from '../../../domain/ports/payment.repository.port';
import type { PaymentMethod } from '../../../domain/entities/payment.entity';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Payment | null> {
        const row = await this.prisma.payment.findUnique({ where: { id } });
        return row ? this.toDomain(row) : null;
    }

    async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
        const rows = await this.prisma.payment.findMany({ where: { invoiceId } });
        return rows.map((r) => this.toDomain(r));
    }

    async create(payment: Payment): Promise<Payment> {
        const row = await this.prisma.payment.create({
            data: {
                id: payment.id,
                invoiceId: payment.invoiceId,
                amount: payment.amount.amount,
                method: payment.method as any,
                paymentDate: payment.paymentDate,
                reference: payment.reference,
                notes: payment.notes,
            },
        });
        return this.toDomain(row);
    }

    private toDomain(row: { id: string; invoiceId: string; amount: any; method: string; paymentDate: Date; reference: string | null; notes: string | null; createdAt: Date }): Payment {
        return Payment.reconstitute({
            id: row.id, invoiceId: row.invoiceId,
            amount: Money.fromDecimal(Number(row.amount)),
            method: row.method as PaymentMethod,
            paymentDate: row.paymentDate, reference: row.reference, notes: row.notes, createdAt: row.createdAt,
        });
    }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { PaymentRepositoryPort, PAYMENT_REPOSITORY } from '../../domain/ports/payment.repository.port';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '../../domain/ports/invoice.repository.port';
import { StatusPropagationDomainService } from '../../domain/services/status-propagation.domain-service';

interface RecordPaymentInput {
    invoiceId: string;
    amount: number;
    method: string;
    paymentDate: Date;
    reference?: string;
    notes?: string;
}

@Injectable()
export class RecordPaymentCommand {
    constructor(
        @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: PaymentRepositoryPort,
        @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort,
        private readonly statusPropagation: StatusPropagationDomainService,
    ) { }

    async execute(input: RecordPaymentInput) {
        const invoice = await this.invoiceRepo.findById(input.invoiceId);
        if (!invoice) throw new Error('Facture introuvable');
        if (invoice.isPaid()) throw new Error('Cette facture est déjà payée');

        const payment = Payment.create({
            id: randomUUID(),
            invoiceId: input.invoiceId,
            amount: Money.fromDecimal(input.amount),
            method: input.method as any,
            paymentDate: input.paymentDate,
            reference: input.reference ?? null,
            notes: input.notes ?? null,
        });

        const saved = await this.paymentRepo.create(payment);
        await this.statusPropagation.markInvoiceAsPaid(input.invoiceId);
        return saved;
    }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Invoice } from '../entities/invoice.entity';
import { Contract } from '../entities/contract.entity';
import { Period } from '../value-objects/period.vo';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '../ports/invoice.repository.port';
import { Inject } from '@nestjs/common';

@Injectable()
export class BillingDomainService {
    constructor(@Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort) { }

    async generateQuarterlyInvoice(contract: Contract, date: Date = new Date()): Promise<Invoice> {
        const period = Period.fromDate(date);

        // Guard: only 1 unpaid invoice per contract per quarter
        const existing = await this.invoiceRepo.findUnpaidByContractAndPeriod(contract.id, period.label);
        if (existing) throw new Error(`Une facture impayée existe déjà pour la période ${period.label}`);

        const invoice = Invoice.create({
            id: randomUUID(),
            contractId: contract.id,
            ownerId: contract.ownerId,
            periodLabel: period.label,
            amount: contract.monthlyRent.multiply(3),
            dueDate: period.computeDueDate(),
        });

        return this.invoiceRepo.create(invoice);
    }
}

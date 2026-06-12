import { Injectable, Inject } from '@nestjs/common';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '../ports/invoice.repository.port';

@Injectable()
export class StatusPropagationDomainService {
    constructor(@Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort) { }

    async markInvoiceAsPaid(invoiceId: string): Promise<void> {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) throw new Error('Facture introuvable');
        await this.invoiceRepo.update(invoice.markAsPaid());
    }
}

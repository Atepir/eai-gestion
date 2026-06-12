import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '../../domain/ports/invoice.repository.port';

@Injectable()
export class GetInvoiceQuery {
    constructor(@Inject(INVOICE_REPOSITORY) private readonly repo: InvoiceRepositoryPort) { }

    async execute(id: string): Promise<Invoice> {
        const invoice = await this.repo.findById(id);
        if (!invoice) throw new NotFoundException('Facture introuvable');
        return invoice;
    }
}

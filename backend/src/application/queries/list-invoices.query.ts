import { Injectable, Inject } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '../../domain/ports/invoice.repository.port';

@Injectable()
export class ListInvoicesQuery {
    constructor(@Inject(INVOICE_REPOSITORY) private readonly repo: InvoiceRepositoryPort) { }

    async execute(ownerId?: string): Promise<Invoice[]> {
        if (ownerId) return this.repo.findByOwnerId(ownerId);
        return this.repo.findAll();
    }
}

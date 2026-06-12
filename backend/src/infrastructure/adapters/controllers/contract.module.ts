import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { InvoicesController } from './invoices.controller';
import { InvoiceCronService } from '../cron/invoice-cron.service';
import { CreateContractCommand } from '../../../application/commands/create-contract.command';
import { GenerateInvoicesCommand } from '../../../application/commands/generate-invoices.command';
import { ListContractsQuery } from '../../../application/queries/list-contracts.query';
import { GetContractQuery } from '../../../application/queries/get-contract.query';
import { ListInvoicesQuery } from '../../../application/queries/list-invoices.query';
import { GetInvoiceQuery } from '../../../application/queries/get-invoice.query';
import { BillingDomainService } from '../../../domain/services/billing.domain-service';

@Module({
    controllers: [ContractsController, InvoicesController],
    providers: [
        CreateContractCommand,
        GenerateInvoicesCommand,
        ListContractsQuery,
        GetContractQuery,
        ListInvoicesQuery,
        GetInvoiceQuery,
        BillingDomainService,
        InvoiceCronService,
    ],
})
export class ContractModule { }

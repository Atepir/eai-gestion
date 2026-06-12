import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GenerateInvoicesCommand } from '../../../application/commands/generate-invoices.command';

@Injectable()
export class InvoiceCronService {
    private readonly logger = new Logger(InvoiceCronService.name);

    constructor(private readonly generateInvoices: GenerateInvoicesCommand) { }

    @Cron('0 0 1 1,4,7,10 *')
    async handleQuarterlyInvoiceGeneration() {
        this.logger.log('Starting quarterly invoice generation...');
        const result = await this.generateInvoices.execute();
        this.logger.log(`Generated ${result.generated} invoices. Errors: ${result.errors.length}`);
    }

    @Cron('0 8 * * *')
    async handleLateCheck() {
        this.logger.log('Running late payment check...');
        // Late payment logic in Phase 4
    }
}

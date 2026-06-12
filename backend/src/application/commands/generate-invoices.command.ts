import { Injectable, Inject } from '@nestjs/common';
import { BillingDomainService } from '../../domain/services/billing.domain-service';
import { ContractRepositoryPort, CONTRACT_REPOSITORY } from '../../domain/ports/contract.repository.port';

@Injectable()
export class GenerateInvoicesCommand {
    constructor(
        @Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepositoryPort,
        private readonly billingService: BillingDomainService,
    ) { }

    async execute(): Promise<{ generated: number; errors: string[] }> {
        const contracts = await this.contractRepo.findActiveAndNotice();
        const errors: string[] = [];
        let generated = 0;

        for (const contract of contracts) {
            try {
                await this.billingService.generateQuarterlyInvoice(contract);
                generated++;
            } catch (err) {
                errors.push(`Contrat ${contract.id}: ${(err as Error).message}`);
            }
        }

        return { generated, errors };
    }
}

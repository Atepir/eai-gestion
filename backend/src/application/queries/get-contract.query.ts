import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Contract } from '../../domain/entities/contract.entity';
import { ContractRepositoryPort, CONTRACT_REPOSITORY } from '../../domain/ports/contract.repository.port';

@Injectable()
export class GetContractQuery {
    constructor(@Inject(CONTRACT_REPOSITORY) private readonly repo: ContractRepositoryPort) { }

    async execute(id: string): Promise<Contract> {
        const contract = await this.repo.findById(id);
        if (!contract) throw new NotFoundException('Contrat introuvable');
        return contract;
    }
}

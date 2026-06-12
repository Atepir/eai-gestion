import { Injectable, Inject } from '@nestjs/common';
import { Contract } from '../../domain/entities/contract.entity';
import { ContractRepositoryPort, CONTRACT_REPOSITORY } from '../../domain/ports/contract.repository.port';

@Injectable()
export class ListContractsQuery {
    constructor(@Inject(CONTRACT_REPOSITORY) private readonly repo: ContractRepositoryPort) { }

    async execute(ownerId?: string): Promise<Contract[]> {
        if (ownerId) return this.repo.findByOwnerId(ownerId);
        return this.repo.findAll();
    }
}

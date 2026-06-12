import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Contract } from '../../domain/entities/contract.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { ContractRepositoryPort, CONTRACT_REPOSITORY } from '../../domain/ports/contract.repository.port';
import { PropertyRepositoryPort, PROPERTY_REPOSITORY } from '../../domain/ports/property.repository.port';

interface CreateContractInput {
    ownerId: string;
    propertyId: string;
    tenantId: string;
    monthlyRent: number;
    startDate: Date;
    endDate: Date;
}

@Injectable()
export class CreateContractCommand {
    constructor(
        @Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepositoryPort,
        @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: PropertyRepositoryPort,
    ) { }

    async execute(input: CreateContractInput): Promise<Contract> {
        const property = await this.propertyRepo.findById(input.propertyId);
        if (!property) throw new Error('Bien introuvable');
        if (!property.isVacant()) throw new ConflictException('Ce bien a déjà un contrat actif');

        const contract = Contract.create({
            id: randomUUID(),
            ownerId: input.ownerId,
            propertyId: input.propertyId,
            tenantId: input.tenantId,
            monthlyRent: Money.fromDecimal(input.monthlyRent),
            startDate: input.startDate,
            endDate: input.endDate,
        });

        const saved = await this.contractRepo.create(contract);

        // Mark property as occupied
        await this.propertyRepo.update(property.markOccupied());

        return saved;
    }
}

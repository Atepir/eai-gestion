import { Contract } from '../entities/contract.entity';

export const CONTRACT_REPOSITORY = Symbol('CONTRACT_REPOSITORY');

export interface ContractRepositoryPort {
    findById(id: string): Promise<Contract | null>;
    findAll(): Promise<Contract[]>;
    findByOwnerId(ownerId: string): Promise<Contract[]>;
    findByPropertyId(propertyId: string): Promise<Contract[]>;
    findActiveByPropertyId(propertyId: string): Promise<Contract | null>;
    findActiveAndNotice(): Promise<Contract[]>;
    findExpiredActiveAndNotice(now: Date): Promise<Contract[]>;
    create(contract: Contract): Promise<Contract>;
    update(contract: Contract): Promise<Contract>;
}

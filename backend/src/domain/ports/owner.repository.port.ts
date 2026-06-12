import { Owner } from '../entities/owner.entity';

export const OWNER_REPOSITORY = Symbol('OWNER_REPOSITORY');

export interface OwnerRepositoryPort {
    findById(id: string): Promise<Owner | null>;
    findByUserId(userId: string): Promise<Owner | null>;
    findAll(): Promise<Owner[]>;
    create(owner: Owner): Promise<Owner>;
    update(owner: Owner): Promise<Owner>;
    delete(id: string): Promise<void>;
}

import { Tenant } from '../entities/tenant.entity';

export const TENANT_REPOSITORY = Symbol('TENANT_REPOSITORY');

export interface TenantRepositoryPort {
    findById(id: string): Promise<Tenant | null>;
    findByOwnerId(ownerId: string): Promise<Tenant[]>;
    findAll(): Promise<Tenant[]>;
    create(tenant: Tenant): Promise<Tenant>;
    update(tenant: Tenant): Promise<Tenant>;
}

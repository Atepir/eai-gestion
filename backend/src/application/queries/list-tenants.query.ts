import { Injectable, Inject } from '@nestjs/common';
import { TenantRepositoryPort, TENANT_REPOSITORY } from '../../domain/ports/tenant.repository.port';

@Injectable()
export class ListTenantsQuery {
    constructor(@Inject(TENANT_REPOSITORY) private readonly repo: TenantRepositoryPort) { }

    async execute(ownerId?: string) {
        if (ownerId) return this.repo.findByOwnerId(ownerId);
        return this.repo.findAll();
    }
}

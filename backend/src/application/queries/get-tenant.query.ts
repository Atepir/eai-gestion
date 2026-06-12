import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { TenantRepositoryPort, TENANT_REPOSITORY } from '../../domain/ports/tenant.repository.port';

@Injectable()
export class GetTenantQuery {
    constructor(@Inject(TENANT_REPOSITORY) private readonly repo: TenantRepositoryPort) { }

    async execute(id: string) {
        const tenant = await this.repo.findById(id);
        if (!tenant) throw new NotFoundException('Locataire introuvable');
        return tenant;
    }
}

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { TenantRepositoryPort, TENANT_REPOSITORY } from '../../domain/ports/tenant.repository.port';

interface UpdateTenantInput {
    firstName?: string;
    lastName?: string;
    idDocumentType?: string;
    idDocumentNumber?: string;
    phone?: string | null;
    email?: string | null;
    profession?: string | null;
}

@Injectable()
export class UpdateTenantCommand {
    constructor(@Inject(TENANT_REPOSITORY) private readonly repo: TenantRepositoryPort) { }

    async execute(id: string, input: UpdateTenantInput) {
        const existing = await this.repo.findById(id);
        if (!existing) throw new NotFoundException('Locataire introuvable');
        const updated = existing.updateDetails(input);
        return this.repo.update(updated);
    }
}

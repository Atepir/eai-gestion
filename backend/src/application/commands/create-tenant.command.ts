import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Tenant } from '../../domain/entities/tenant.entity';
import { TenantRepositoryPort, TENANT_REPOSITORY } from '../../domain/ports/tenant.repository.port';

interface CreateTenantInput {
    ownerId: string;
    firstName: string;
    lastName: string;
    idDocumentType: string;
    idDocumentNumber: string;
    phone?: string | null;
    email?: string | null;
    profession?: string | null;
}

@Injectable()
export class CreateTenantCommand {
    constructor(@Inject(TENANT_REPOSITORY) private readonly repo: TenantRepositoryPort) { }

    async execute(input: CreateTenantInput): Promise<Tenant> {
        const tenant = Tenant.create({
            id: randomUUID(),
            ownerId: input.ownerId,
            firstName: input.firstName,
            lastName: input.lastName,
            idDocumentType: input.idDocumentType,
            idDocumentNumber: input.idDocumentNumber,
            phone: input.phone ?? null,
            email: input.email ?? null,
            profession: input.profession ?? null,
        });
        return this.repo.create(tenant);
    }
}

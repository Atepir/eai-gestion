import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { TenantRepositoryPort } from '../../../domain/ports/tenant.repository.port';

@Injectable()
export class PrismaTenantRepository implements TenantRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Tenant | null> {
        const row = await this.prisma.tenant.findUnique({ where: { id } });
        return row ? this.toDomain(row) : null;
    }

    async findByOwnerId(ownerId: string): Promise<Tenant[]> {
        const rows = await this.prisma.tenant.findMany({ where: { ownerId } });
        return rows.map((r) => this.toDomain(r));
    }

    async findAll(): Promise<Tenant[]> {
        const rows = await this.prisma.tenant.findMany();
        return rows.map((r) => this.toDomain(r));
    }

    async create(tenant: Tenant): Promise<Tenant> {
        const row = await this.prisma.tenant.create({
            data: {
                id: tenant.id,
                ownerId: tenant.ownerId,
                firstName: tenant.firstName,
                lastName: tenant.lastName,
                idDocumentType: tenant.idDocumentType,
                idDocumentNumber: tenant.idDocumentNumber,
                phone: tenant.phone,
                email: tenant.email,
                profession: tenant.profession,
            },
        });
        return this.toDomain(row);
    }

    async update(tenant: Tenant): Promise<Tenant> {
        const row = await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                firstName: tenant.firstName,
                lastName: tenant.lastName,
                idDocumentType: tenant.idDocumentType,
                idDocumentNumber: tenant.idDocumentNumber,
                phone: tenant.phone,
                email: tenant.email,
                profession: tenant.profession,
            },
        });
        return this.toDomain(row);
    }

    private toDomain(row: {
        id: string;
        ownerId: string;
        firstName: string;
        lastName: string;
        idDocumentType: string;
        idDocumentNumber: string;
        phone: string | null;
        email: string | null;
        profession: string | null;
        createdAt: Date;
    }): Tenant {
        return Tenant.reconstitute({
            id: row.id,
            ownerId: row.ownerId,
            firstName: row.firstName,
            lastName: row.lastName,
            idDocumentType: row.idDocumentType,
            idDocumentNumber: row.idDocumentNumber,
            phone: row.phone,
            email: row.email,
            profession: row.profession,
            createdAt: row.createdAt,
        });
    }
}

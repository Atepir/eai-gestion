import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Contract } from '../../../domain/entities/contract.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { ContractRepositoryPort } from '../../../domain/ports/contract.repository.port';
import type { ContractStatus } from '../../../domain/entities/contract.entity';

@Injectable()
export class PrismaContractRepository implements ContractRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Contract | null> {
        const row = await this.prisma.contract.findUnique({ where: { id } });
        return row ? this.toDomain(row) : null;
    }

    async findAll(): Promise<Contract[]> {
        const rows = await this.prisma.contract.findMany();
        return rows.map((r) => this.toDomain(r));
    }

    async findByOwnerId(ownerId: string): Promise<Contract[]> {
        const rows = await this.prisma.contract.findMany({ where: { ownerId } });
        return rows.map((r) => this.toDomain(r));
    }

    async findByPropertyId(propertyId: string): Promise<Contract[]> {
        const rows = await this.prisma.contract.findMany({ where: { propertyId } });
        return rows.map((r) => this.toDomain(r));
    }

    async findActiveByPropertyId(propertyId: string): Promise<Contract | null> {
        const row = await this.prisma.contract.findFirst({
            where: { propertyId, status: { in: ['ACTIVE', 'NOTICE'] } },
        });
        return row ? this.toDomain(row) : null;
    }

    async findActiveAndNotice(): Promise<Contract[]> {
        const rows = await this.prisma.contract.findMany({
            where: { status: { in: ['ACTIVE', 'NOTICE'] } },
        });
        return rows.map((r) => this.toDomain(r));
    }

    async findExpiredActiveAndNotice(now: Date): Promise<Contract[]> {
        const rows = await this.prisma.contract.findMany({
            where: {
                status: { in: ['ACTIVE', 'NOTICE'] },
                endDate: { lt: now },
            },
        });
        return rows.map((r) => this.toDomain(r));
    }

    async create(contract: Contract): Promise<Contract> {
        const row = await this.prisma.contract.create({
            data: {
                id: contract.id,
                ownerId: contract.ownerId,
                propertyId: contract.propertyId,
                tenantId: contract.tenantId,
                monthlyRent: contract.monthlyRent.amount,
                startDate: contract.startDate,
                endDate: contract.endDate,
                status: contract.status as any,
            },
        });
        return this.toDomain(row);
    }

    async update(contract: Contract): Promise<Contract> {
        const row = await this.prisma.contract.update({
            where: { id: contract.id },
            data: {
                monthlyRent: contract.monthlyRent.amount,
                endDate: contract.endDate,
                status: contract.status as any,
                updatedAt: new Date(),
            },
        });
        return this.toDomain(row);
    }

    private toDomain(row: {
        id: string; ownerId: string; propertyId: string; tenantId: string;
        monthlyRent: any; startDate: Date; endDate: Date; status: string;
        createdAt: Date; updatedAt: Date;
    }): Contract {
        return Contract.reconstitute({
            id: row.id,
            ownerId: row.ownerId,
            propertyId: row.propertyId,
            tenantId: row.tenantId,
            monthlyRent: Money.fromDecimal(Number(row.monthlyRent)),
            startDate: row.startDate,
            endDate: row.endDate,
            status: row.status as ContractStatus,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}

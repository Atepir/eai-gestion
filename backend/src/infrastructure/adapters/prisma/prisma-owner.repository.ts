import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Owner } from '../../../domain/entities/owner.entity';
import { OwnerRepositoryPort } from '../../../domain/ports/owner.repository.port';

@Injectable()
export class PrismaOwnerRepository implements OwnerRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Owner | null> {
        const row = await this.prisma.owner.findUnique({ where: { id } });
        if (!row) return null;
        return this.toDomain(row);
    }

    async findByUserId(userId: string): Promise<Owner | null> {
        const row = await this.prisma.owner.findUnique({ where: { userId } });
        if (!row) return null;
        return this.toDomain(row);
    }

    async findAll(): Promise<Owner[]> {
        const rows = await this.prisma.owner.findMany();
        return rows.map((r) => this.toDomain(r));
    }

    async create(owner: Owner): Promise<Owner> {
        const row = await this.prisma.owner.create({
            data: {
                id: owner.id,
                userId: owner.userId,
                name: owner.name,
                email: owner.email,
                phone: owner.phone,
                address: owner.address,
            },
        });
        return this.toDomain(row);
    }

    async update(owner: Owner): Promise<Owner> {
        const row = await this.prisma.owner.update({
            where: { id: owner.id },
            data: {
                name: owner.name,
                email: owner.email,
                phone: owner.phone,
                address: owner.address,
            },
        });
        return this.toDomain(row);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.owner.delete({ where: { id } });
    }

    private toDomain(row: {
        id: string;
        userId: string;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        createdAt: Date;
    }): Owner {
        return Owner.reconstitute({
            id: row.id,
            userId: row.userId,
            name: row.name,
            email: row.email,
            phone: row.phone,
            address: row.address,
            createdAt: row.createdAt,
        });
    }
}

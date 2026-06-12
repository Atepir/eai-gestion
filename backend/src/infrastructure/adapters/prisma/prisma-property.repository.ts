import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Property } from '../../../domain/entities/property.entity';
import { Address } from '../../../domain/value-objects/address.vo';
import { PropertyRepositoryPort } from '../../../domain/ports/property.repository.port';
import type { PropertyType, PropertyStatus } from '../../../domain/entities/property.entity';

@Injectable()
export class PrismaPropertyRepository implements PropertyRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Property | null> {
        const row = await this.prisma.property.findUnique({ where: { id } });
        return row ? this.toDomain(row) : null;
    }

    async findByOwnerId(ownerId: string): Promise<Property[]> {
        const rows = await this.prisma.property.findMany({ where: { ownerId } });
        return rows.map((r) => this.toDomain(r));
    }

    async findAll(): Promise<Property[]> {
        const rows = await this.prisma.property.findMany();
        return rows.map((r) => this.toDomain(r));
    }

    async create(property: Property): Promise<Property> {
        const row = await this.prisma.property.create({
            data: {
                id: property.id,
                ownerId: property.ownerId,
                designation: property.designation,
                addressStreet: property.address.street,
                addressCity: property.address.city,
                addressZip: property.address.zip,
                type: property.type as any,
                status: property.status as any,
            },
        });
        return this.toDomain(row);
    }

    async update(property: Property): Promise<Property> {
        const row = await this.prisma.property.update({
            where: { id: property.id },
            data: {
                designation: property.designation,
                addressStreet: property.address.street,
                addressCity: property.address.city,
                addressZip: property.address.zip,
                type: property.type as any,
                status: property.status as any,
            },
        });
        return this.toDomain(row);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.property.delete({ where: { id } });
    }

    private toDomain(row: {
        id: string;
        ownerId: string;
        designation: string;
        addressStreet: string;
        addressCity: string;
        addressZip: string;
        type: string;
        status: string;
        createdAt: Date;
    }): Property {
        return Property.reconstitute({
            id: row.id,
            ownerId: row.ownerId,
            designation: row.designation,
            address: Address.create({
                street: row.addressStreet,
                city: row.addressCity,
                zip: row.addressZip,
            }),
            type: row.type as PropertyType,
            status: row.status as PropertyStatus,
            createdAt: row.createdAt,
        });
    }
}

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Property } from '../../domain/entities/property.entity';
import { Address } from '../../domain/value-objects/address.vo';
import { PropertyRepositoryPort, PROPERTY_REPOSITORY } from '../../domain/ports/property.repository.port';
import type { PropertyType } from '../../domain/entities/property.entity';

interface CreatePropertyInput {
    ownerId: string;
    designation: string;
    street: string;
    city: string;
    zip: string;
    type: PropertyType;
}

@Injectable()
export class CreatePropertyCommand {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repo: PropertyRepositoryPort) { }

    async execute(input: CreatePropertyInput): Promise<Property> {
        const property = Property.create({
            id: randomUUID(),
            ownerId: input.ownerId,
            designation: input.designation,
            address: Address.create({ street: input.street, city: input.city, zip: input.zip }),
            type: input.type,
        });
        return this.repo.create(property);
    }
}

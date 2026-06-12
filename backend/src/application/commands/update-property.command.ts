import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Address } from '../../domain/value-objects/address.vo';
import { PropertyRepositoryPort, PROPERTY_REPOSITORY } from '../../domain/ports/property.repository.port';
import type { PropertyType } from '../../domain/entities/property.entity';

interface UpdatePropertyInput {
    designation?: string;
    street?: string;
    city?: string;
    zip?: string;
    type?: PropertyType;
}

@Injectable()
export class UpdatePropertyCommand {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repo: PropertyRepositoryPort) { }

    async execute(id: string, input: UpdatePropertyInput) {
        const existing = await this.repo.findById(id);
        if (!existing) throw new NotFoundException('Bien introuvable');

        const address = input.street || input.city || input.zip
            ? Address.create({
                street: input.street ?? existing.address.street,
                city: input.city ?? existing.address.city,
                zip: input.zip ?? existing.address.zip,
            })
            : undefined;

        const updated = existing.updateDetails({
            designation: input.designation,
            address,
            type: input.type,
        });
        return this.repo.update(updated);
    }
}

import { Injectable, Inject } from '@nestjs/common';
import { PropertyRepositoryPort, PROPERTY_REPOSITORY } from '../../domain/ports/property.repository.port';

@Injectable()
export class ListPropertiesQuery {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repo: PropertyRepositoryPort) { }

    async execute(ownerId?: string) {
        if (ownerId) return this.repo.findByOwnerId(ownerId);
        return this.repo.findAll();
    }
}

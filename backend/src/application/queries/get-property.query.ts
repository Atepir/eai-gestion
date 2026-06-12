import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PropertyRepositoryPort, PROPERTY_REPOSITORY } from '../../domain/ports/property.repository.port';

@Injectable()
export class GetPropertyQuery {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repo: PropertyRepositoryPort) { }

    async execute(id: string) {
        const property = await this.repo.findById(id);
        if (!property) throw new NotFoundException('Bien introuvable');
        return property;
    }
}

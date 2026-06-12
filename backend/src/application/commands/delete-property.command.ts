import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PropertyRepositoryPort, PROPERTY_REPOSITORY } from '../../domain/ports/property.repository.port';

@Injectable()
export class DeletePropertyCommand {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repo: PropertyRepositoryPort) { }

    async execute(id: string): Promise<void> {
        const existing = await this.repo.findById(id);
        if (!existing) throw new NotFoundException('Bien introuvable');
        await this.repo.delete(id);
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { OwnerRepositoryPort, OWNER_REPOSITORY } from '../../domain/ports/owner.repository.port';

@Injectable()
export class DeleteOwnerCommand {
    constructor(
        @Inject(OWNER_REPOSITORY) private readonly ownerRepo: OwnerRepositoryPort,
    ) { }

    async execute(id: string): Promise<void> {
        const existing = await this.ownerRepo.findById(id);
        if (!existing) {
            throw new NotFoundException('Propriétaire introuvable');
        }
        await this.ownerRepo.delete(id);
    }
}

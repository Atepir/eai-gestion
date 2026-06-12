import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Owner } from '../../domain/entities/owner.entity';
import { OwnerRepositoryPort, OWNER_REPOSITORY } from '../../domain/ports/owner.repository.port';

@Injectable()
export class UpdateOwnerCommand {
    constructor(
        @Inject(OWNER_REPOSITORY) private readonly ownerRepo: OwnerRepositoryPort,
    ) { }

    async execute(
        id: string,
        update: { name?: string; email?: string; phone?: string | null; address?: string | null },
    ): Promise<Owner> {
        const existing = await this.ownerRepo.findById(id);
        if (!existing) {
            throw new NotFoundException('Propriétaire introuvable');
        }
        const updated = existing.updateDetails(update);
        return this.ownerRepo.update(updated);
    }
}

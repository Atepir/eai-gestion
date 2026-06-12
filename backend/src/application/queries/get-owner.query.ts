import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Owner } from '../../domain/entities/owner.entity';
import { OwnerRepositoryPort, OWNER_REPOSITORY } from '../../domain/ports/owner.repository.port';

@Injectable()
export class GetOwnerQuery {
    constructor(
        @Inject(OWNER_REPOSITORY) private readonly ownerRepo: OwnerRepositoryPort,
    ) { }

    async execute(id: string): Promise<Owner> {
        const owner = await this.ownerRepo.findById(id);
        if (!owner) {
            throw new NotFoundException('Propriétaire introuvable');
        }
        return owner;
    }
}

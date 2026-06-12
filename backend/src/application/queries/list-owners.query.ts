import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Owner } from '../../domain/entities/owner.entity';
import { OwnerRepositoryPort, OWNER_REPOSITORY } from '../../domain/ports/owner.repository.port';

@Injectable()
export class ListOwnersQuery {
    constructor(
        @Inject(OWNER_REPOSITORY) private readonly ownerRepo: OwnerRepositoryPort,
    ) { }

    async execute(): Promise<Owner[]> {
        return this.ownerRepo.findAll();
    }
}

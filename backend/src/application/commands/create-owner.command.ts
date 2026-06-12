import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Owner } from '../../domain/entities/owner.entity';
import { OwnerRepositoryPort, OWNER_REPOSITORY } from '../../domain/ports/owner.repository.port';

interface CreateOwnerInput {
    userId: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
}

@Injectable()
export class CreateOwnerCommand {
    constructor(
        @Inject(OWNER_REPOSITORY) private readonly ownerRepo: OwnerRepositoryPort,
    ) { }

    async execute(input: CreateOwnerInput): Promise<Owner> {
        const owner = Owner.create({
            id: randomUUID(),
            userId: input.userId,
            name: input.name,
            email: input.email,
            phone: input.phone ?? null,
            address: input.address ?? null,
        });
        return this.ownerRepo.create(owner);
    }
}

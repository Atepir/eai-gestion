import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '../../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        const row = await this.prisma.user.findUnique({ where: { email } });
        if (!row) return null;
        return User.reconstitute({
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            role: row.role,
            createdAt: row.createdAt,
        });
    }

    async findById(id: string): Promise<User | null> {
        const row = await this.prisma.user.findUnique({ where: { id } });
        if (!row) return null;
        return User.reconstitute({
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            role: row.role,
            createdAt: row.createdAt,
        });
    }

    async create(user: User): Promise<User> {
        const row = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                passwordHash: user.passwordHash,
                role: user.role,
            },
        });
        return User.reconstitute({
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            role: row.role,
            createdAt: row.createdAt,
        });
    }
}

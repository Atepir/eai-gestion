import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';
import { UserRepositoryPort, USER_REPOSITORY } from '../../domain/ports/user.repository.port';

@Injectable()
export class LoginCommand {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
        private readonly jwtService: JwtService,
    ) { }

    async execute(email: string, password: string) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error('Identifiants invalides');
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new Error('Identifiants invalides');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepositoryPort, USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import { Inject } from '@nestjs/common';
import { OwnerRepositoryPort, OWNER_REPOSITORY } from '../../../domain/ports/owner.repository.port';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

export interface RequestUser {
    userId: string;
    email: string;
    role: string;
    ownerId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
        @Inject(OWNER_REPOSITORY) private readonly ownerRepo: OwnerRepositoryPort,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
        });
    }

    async validate(payload: JwtPayload): Promise<RequestUser> {
        const user = await this.userRepo.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Utilisateur introuvable');
        }
        const result: RequestUser = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        if (user.role === 'OWNER') {
            const owner = await this.ownerRepo.findByUserId(user.id);
            result.ownerId = owner?.id;
        }
        return result;
    }
}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../controllers/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LoginCommand } from '../../../application/commands/login.command';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET', 'dev-secret'),
                signOptions: { expiresIn: '24h' as const },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [JwtStrategy, LoginCommand],
    exports: [JwtModule],
})
export class AuthModule { }

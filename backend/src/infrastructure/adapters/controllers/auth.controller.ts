import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginCommand } from '../../../application/commands/login.command';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { IsEmail, IsString, MinLength } from 'class-validator';

class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(1)
    password!: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly loginCommand: LoginCommand) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        try {
            return await this.loginCommand.execute(dto.email, dto.password);
        } catch (err) {
            throw new UnauthorizedException((err as Error).message);
        }
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getMe(@CurrentUser() user: RequestUser) {
        return user;
    }
}

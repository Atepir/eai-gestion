import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { CreateOwnerCommand } from '../../../application/commands/create-owner.command';
import { UpdateOwnerCommand } from '../../../application/commands/update-owner.command';
import { DeleteOwnerCommand } from '../../../application/commands/delete-owner.command';
import { ListOwnersQuery } from '../../../application/queries/list-owners.query';
import { GetOwnerQuery } from '../../../application/queries/get-owner.query';
import { RolesGuard, Roles } from '../auth/roles.guard';
import type { RequestUser } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

class CreateOwnerDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;
}

class UpdateOwnerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string | null;

    @IsOptional()
    @IsString()
    address?: string | null;
}

@Controller('owners')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OwnersController {
    constructor(
        private readonly createOwnerCommand: CreateOwnerCommand,
        private readonly updateOwnerCommand: UpdateOwnerCommand,
        private readonly deleteOwnerCommand: DeleteOwnerCommand,
        private readonly listOwnersQuery: ListOwnersQuery,
        private readonly getOwnerQuery: GetOwnerQuery,
    ) { }

    @Get()
    async findAll(@CurrentUser() user: RequestUser) {
        return this.listOwnersQuery.execute();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.getOwnerQuery.execute(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(
        @Body() dto: CreateOwnerDto,
        @CurrentUser() user: RequestUser,
    ) {
        return this.createOwnerCommand.execute({
            userId: user.userId,
            ...dto,
        });
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateOwnerDto) {
        return this.updateOwnerCommand.execute(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        await this.deleteOwnerCommand.execute(id);
    }
}

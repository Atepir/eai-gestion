import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional } from 'class-validator';
import { CreateTenantCommand } from '../../../application/commands/create-tenant.command';
import { UpdateTenantCommand } from '../../../application/commands/update-tenant.command';
import { ListTenantsQuery } from '../../../application/queries/list-tenants.query';
import { GetTenantQuery } from '../../../application/queries/get-tenant.query';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';

class CreateTenantDto {
    @IsString() firstName!: string;
    @IsString() lastName!: string;
    @IsString() idDocumentType!: string;
    @IsString() idDocumentNumber!: string;
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsString() email?: string;
    @IsOptional() @IsString() profession?: string;
}

class UpdateTenantDto {
    @IsOptional() @IsString() firstName?: string;
    @IsOptional() @IsString() lastName?: string;
    @IsOptional() @IsString() idDocumentType?: string;
    @IsOptional() @IsString() idDocumentNumber?: string;
    @IsOptional() @IsString() phone?: string | null;
    @IsOptional() @IsString() email?: string | null;
    @IsOptional() @IsString() profession?: string | null;
}

@Controller('tenants')
@UseGuards(AuthGuard('jwt'))
export class TenantsController {
    constructor(
        private readonly createCmd: CreateTenantCommand,
        private readonly updateCmd: UpdateTenantCommand,
        private readonly listQry: ListTenantsQuery,
        private readonly getQry: GetTenantQuery,
    ) { }

    @Get()
    async findAll(@CurrentUser() user: RequestUser) {
        return this.listQry.execute(user.role === 'ADMIN' ? undefined : user.ownerId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.getQry.execute(id);
    }

    @Post()
    async create(@Body() dto: CreateTenantDto, @CurrentUser() user: RequestUser) {
        return this.createCmd.execute({ ...dto, ownerId: user.ownerId ?? user.userId });
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
        return this.updateCmd.execute(id, dto);
    }
}

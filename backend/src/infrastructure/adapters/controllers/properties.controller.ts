import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CreatePropertyCommand } from '../../../application/commands/create-property.command';
import { UpdatePropertyCommand } from '../../../application/commands/update-property.command';
import { DeletePropertyCommand } from '../../../application/commands/delete-property.command';
import { ListPropertiesQuery } from '../../../application/queries/list-properties.query';
import { GetPropertyQuery } from '../../../application/queries/get-property.query';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';

enum PropertyTypeEnum {
    APARTMENT = 'APARTMENT',
    HOUSE = 'HOUSE',
    COMMERCIAL = 'COMMERCIAL',
    LAND = 'LAND',
}

class CreatePropertyDto {
    @IsString() designation!: string;
    @IsString() street!: string;
    @IsString() city!: string;
    @IsString() zip!: string;
    @IsEnum(PropertyTypeEnum) type!: PropertyTypeEnum;
}

class UpdatePropertyDto {
    @IsOptional() @IsString() designation?: string;
    @IsOptional() @IsString() street?: string;
    @IsOptional() @IsString() city?: string;
    @IsOptional() @IsString() zip?: string;
    @IsOptional() @IsEnum(PropertyTypeEnum) type?: PropertyTypeEnum;
}

@Controller('properties')
@UseGuards(AuthGuard('jwt'))
export class PropertiesController {
    constructor(
        private readonly createCmd: CreatePropertyCommand,
        private readonly updateCmd: UpdatePropertyCommand,
        private readonly deleteCmd: DeletePropertyCommand,
        private readonly listQry: ListPropertiesQuery,
        private readonly getQry: GetPropertyQuery,
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
    async create(@Body() dto: CreatePropertyDto, @CurrentUser() user: RequestUser) {
        return this.createCmd.execute({ ...dto, ownerId: user.ownerId ?? user.userId });
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
        return this.updateCmd.execute(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        await this.deleteCmd.execute(id);
    }
}

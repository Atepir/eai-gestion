import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNumber, IsDateString } from 'class-validator';
import { CreateContractCommand } from '../../../application/commands/create-contract.command';
import { ListContractsQuery } from '../../../application/queries/list-contracts.query';
import { GetContractQuery } from '../../../application/queries/get-contract.query';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';

class CreateContractDto {
    @IsString() propertyId!: string;
    @IsString() tenantId!: string;
    @IsNumber() monthlyRent!: number;
    @IsDateString() startDate!: string;
    @IsDateString() endDate!: string;
}

@Controller('contracts')
@UseGuards(AuthGuard('jwt'))
export class ContractsController {
    constructor(
        private readonly createCmd: CreateContractCommand,
        private readonly listQry: ListContractsQuery,
        private readonly getQry: GetContractQuery,
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
    async create(@Body() dto: CreateContractDto, @CurrentUser() user: RequestUser) {
        return this.createCmd.execute({
            ...dto,
            ownerId: user.ownerId ?? user.userId,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
        });
    }
}

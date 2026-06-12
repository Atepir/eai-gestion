import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { CreateTenantCommand } from '../../../application/commands/create-tenant.command';
import { UpdateTenantCommand } from '../../../application/commands/update-tenant.command';
import { ListTenantsQuery } from '../../../application/queries/list-tenants.query';
import { GetTenantQuery } from '../../../application/queries/get-tenant.query';

@Module({
    controllers: [TenantsController],
    providers: [CreateTenantCommand, UpdateTenantCommand, ListTenantsQuery, GetTenantQuery],
})
export class TenantModule { }

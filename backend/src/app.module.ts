import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './infrastructure/adapters/prisma/prisma.module';
import { RepositoriesModule } from './infrastructure/adapters/prisma/repositories.module';
import { AuthModule } from './infrastructure/adapters/auth/auth.module';
import { OwnerModule } from './infrastructure/adapters/controllers/owner.module';
import { PropertyModule } from './infrastructure/adapters/controllers/property.module';
import { TenantModule } from './infrastructure/adapters/controllers/tenant.module';
import { ContractModule } from './infrastructure/adapters/controllers/contract.module';
import { OperationModule } from './infrastructure/adapters/controllers/operation.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ScheduleModule.forRoot(),
        PrismaModule,
        RepositoriesModule,
        AuthModule,
        OwnerModule,
        PropertyModule,
        TenantModule,
        ContractModule,
        OperationModule,
    ],
})
export class AppModule { }

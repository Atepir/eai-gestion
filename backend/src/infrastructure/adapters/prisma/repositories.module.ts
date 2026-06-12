import { Global, Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import { OWNER_REPOSITORY } from '../../../domain/ports/owner.repository.port';
import { PROPERTY_REPOSITORY } from '../../../domain/ports/property.repository.port';
import { TENANT_REPOSITORY } from '../../../domain/ports/tenant.repository.port';
import { CONTRACT_REPOSITORY } from '../../../domain/ports/contract.repository.port';
import { INVOICE_REPOSITORY } from '../../../domain/ports/invoice.repository.port';
import { PAYMENT_REPOSITORY } from '../../../domain/ports/payment.repository.port';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaOwnerRepository } from './prisma-owner.repository';
import { PrismaPropertyRepository } from './prisma-property.repository';
import { PrismaTenantRepository } from './prisma-tenant.repository';
import { PrismaContractRepository } from './prisma-contract.repository';
import { PrismaInvoiceRepository } from './prisma-invoice.repository';
import { PrismaPaymentRepository } from './prisma-payment.repository';

@Global()
@Module({
    providers: [
        { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
        { provide: OWNER_REPOSITORY, useClass: PrismaOwnerRepository },
        { provide: PROPERTY_REPOSITORY, useClass: PrismaPropertyRepository },
        { provide: TENANT_REPOSITORY, useClass: PrismaTenantRepository },
        { provide: CONTRACT_REPOSITORY, useClass: PrismaContractRepository },
        { provide: INVOICE_REPOSITORY, useClass: PrismaInvoiceRepository },
        { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
    ],
    exports: [
        USER_REPOSITORY,
        OWNER_REPOSITORY,
        PROPERTY_REPOSITORY,
        TENANT_REPOSITORY,
        CONTRACT_REPOSITORY,
        INVOICE_REPOSITORY,
        PAYMENT_REPOSITORY,
    ],
})
export class RepositoriesModule { }

import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { TerminationsController } from './terminations.controller';
import { MetersController } from './meters.controller';
import { DashboardController } from './dashboard.controller';
import { RecordPaymentCommand } from '../../../application/commands/record-payment.command';
import { StatusPropagationDomainService } from '../../../domain/services/status-propagation.domain-service';
import { TerminationDomainService } from '../../../domain/services/termination.domain-service';
import { DashboardQuery } from '../../../application/queries/dashboard.query';

@Module({
    controllers: [PaymentsController, TerminationsController, MetersController, DashboardController],
    providers: [RecordPaymentCommand, StatusPropagationDomainService, TerminationDomainService, DashboardQuery],
})
export class OperationModule { }

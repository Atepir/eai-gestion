import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GenerateInvoicesCommand } from '../../../application/commands/generate-invoices.command';
import { ListInvoicesQuery } from '../../../application/queries/list-invoices.query';
import { GetInvoiceQuery } from '../../../application/queries/get-invoice.query';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
    constructor(
        private readonly generateCmd: GenerateInvoicesCommand,
        private readonly listQry: ListInvoicesQuery,
        private readonly getQry: GetInvoiceQuery,
    ) { }

    @Get()
    async findAll(@CurrentUser() user: RequestUser) {
        return this.listQry.execute(user.role === 'ADMIN' ? undefined : user.ownerId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.getQry.execute(id);
    }

    @Post('generate')
    async generate() {
        return this.generateCmd.execute();
    }
}

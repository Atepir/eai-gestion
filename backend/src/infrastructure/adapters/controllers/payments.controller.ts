import { Controller, Get, Post, Param, Body, UseGuards, NotFoundException, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { Response } from 'express';
import { RecordPaymentCommand } from '../../../application/commands/record-payment.command';
import { Inject } from '@nestjs/common';
import { PAYMENT_REPOSITORY, PaymentRepositoryPort } from '../../../domain/ports/payment.repository.port';
import * as PDFDocument from 'pdfkit';

enum PaymentMethodEnum {
    CASH = 'CASH', CHECK = 'CHECK', TRANSFER = 'TRANSFER', MOBILE_MONEY = 'MOBILE_MONEY',
}

class RecordPaymentDto {
    @IsString() invoiceId!: string;
    @IsNumber() amount!: number;
    @IsEnum(PaymentMethodEnum) method!: PaymentMethodEnum;
    @IsDateString() paymentDate!: string;
    @IsOptional() @IsString() reference?: string;
    @IsOptional() @IsString() notes?: string;
}

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(
        private readonly recordCmd: RecordPaymentCommand,
        @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: PaymentRepositoryPort,
    ) { }

    @Post()
    async create(@Body() dto: RecordPaymentDto) {
        return this.recordCmd.execute({ ...dto, paymentDate: new Date(dto.paymentDate) });
    }

    @Get(':id/receipt')
    async receipt(@Param('id') id: string, @Res() res: Response) {
        const payment = await this.paymentRepo.findById(id);
        if (!payment) throw new NotFoundException('Paiement introuvable');

        const doc = new PDFDocument({ size: 'A5', margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=recu-${id.slice(0, 8)}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('Reçu de paiement', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#666').text(`N° ${id.slice(0, 8).toUpperCase()}`, { align: 'center' });
        doc.moveDown(1);

        // Separator
        doc.moveTo(50, doc.y).lineTo(370, doc.y).stroke('#ddd');
        doc.moveDown(0.5);

        // Details
        const details = [
            ['Date', payment.paymentDate.toLocaleDateString('fr-FR')],
            ['Montant', payment.amount.toString()],
            ['Mode', methodLabelsFr[payment.method] ?? payment.method],
            ['Référence', payment.reference ?? '—'],
        ];
        for (const [label, value] of details) {
            doc.fontSize(11).font('Helvetica-Bold').text(label + ':', { continued: true });
            doc.font('Helvetica').fillColor('#333').text(` ${value}`);
            doc.moveDown(0.3);
        }

        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(370, doc.y).stroke('#ddd');
        doc.moveDown(0.5);
        doc.fontSize(8).fillColor('#999').text('Document généré par EAI Gestion Immobilière', { align: 'center' });

        doc.end();
    }
}

const methodLabelsFr: Record<string, string> = {
    CASH: 'Espèces',
    CHECK: 'Chèque',
    TRANSFER: 'Virement',
    MOBILE_MONEY: 'Mobile Money',
};

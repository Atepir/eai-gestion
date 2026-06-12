import { Controller, Get, Post, Put, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { Meter } from '../../../domain/entities/meter.entity';
import { MeterReadingVO } from '../../../domain/value-objects/meter-reading.vo';

const meterStore = new Map<string, Meter>();

@Controller('meters')
@UseGuards(AuthGuard('jwt'))
export class MetersController {
    @Get()
    async findAll() {
        return Array.from(meterStore.values()).map((m) => ({
            id: m.id,
            propertyId: m.propertyId,
            type: m.type,
            entryReading: m.reading.entry,
            exitReading: m.reading.exit,
            consumption: m.reading.consumption,
            status: m.status,
        }));
    }

    @Post()
    async create(@Body() dto: { propertyId: string; type: 'WATER' | 'ELECTRICITY' }) {
        const meter = Meter.create({
            id: randomUUID(),
            propertyId: dto.propertyId,
            type: dto.type,
        });
        meterStore.set(meter.id, meter);

        return {
            id: meter.id,
            propertyId: meter.propertyId,
            type: meter.type,
            status: meter.status,
        };
    }

    @Put(':id/readings')
    async recordReading(@Param('id') id: string, @Body() dto: { entryReading: number; exitReading: number }) {
        const meter = meterStore.get(id);
        if (!meter) throw new NotFoundException('Compteur introuvable');

        const updated = meter.recordReading(dto.entryReading, dto.exitReading);
        meterStore.set(id, updated);

        return {
            id: updated.id,
            type: updated.type,
            entryReading: updated.reading.entry,
            exitReading: updated.reading.exit,
            consumption: updated.reading.consumption,
            status: updated.status,
        };
    }
}

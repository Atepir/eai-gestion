import { Controller, Get, Post, Put, Param, Body, UseGuards, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { ContractRepositoryPort, CONTRACT_REPOSITORY } from '../../../domain/ports/contract.repository.port';
import { PropertyRepositoryPort, PROPERTY_REPOSITORY } from '../../../domain/ports/property.repository.port';
import { TerminationDomainService } from '../../../domain/services/termination.domain-service';
import { Termination } from '../../../domain/entities/termination.entity';
import { TerminationChecklist } from '../../../domain/value-objects/checklist-item.vo';

class CreateTerminationDto {
    contractId!: string;
    depositAmount?: number;
}

class UpdateChecklistDto {
    checklist?: { label: string; completed: boolean; orderIndex: number }[];
    depositRefunded?: boolean;
}

// In-memory store for terminations (will move to Prisma adapter in full impl)
const terminationStore = new Map<string, Termination>();

@Controller('terminations')
@UseGuards(AuthGuard('jwt'))
export class TerminationsController {
    constructor(
        @Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepositoryPort,
        @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: PropertyRepositoryPort,
        private readonly terminationService: TerminationDomainService,
    ) { }

    @Get()
    async findAll() {
        return Array.from(terminationStore.values()).map((t) => ({
            id: t.id,
            contractId: t.contractId,
            noticeDate: t.noticeDate,
            endDate: t.endDate,
            status: t.status,
            depositRefunded: t.depositRefunded,
            remainingDays: t.remainingDays(),
            checklistProgress: t.checklist.progress(),
        }));
    }

    @Post()
    async create(@Body() dto: CreateTerminationDto) {
        const contract = await this.contractRepo.findById(dto.contractId);
        if (!contract) throw new NotFoundException('Contrat introuvable');
        if (!contract.isActive()) throw new BadRequestException('Le contrat doit être actif ou en préavis');

        const termination = this.terminationService.initiate(contract, dto.depositAmount);
        const updatedContract = contract.markAsNotice();
        await this.contractRepo.update(updatedContract);

        terminationStore.set(termination.id, termination);

        return {
            id: termination.id,
            contractId: termination.contractId,
            noticeDate: termination.noticeDate,
            endDate: termination.endDate,
            status: termination.status,
            remainingDays: termination.remainingDays(),
            checklist: termination.checklist.items,
        };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateChecklistDto) {
        let termination = terminationStore.get(id);
        if (!termination) throw new NotFoundException('Résiliation introuvable');

        if (dto.checklist) {
            termination = termination.updateChecklist(TerminationChecklist.reconstitute(dto.checklist));
        }
        if (dto.depositRefunded) {
            termination = termination.markDepositRefunded();
        }
        terminationStore.set(id, termination);

        return {
            id,
            checklist: termination.checklist.items,
            depositRefunded: termination.depositRefunded,
            canClose: termination.canClose(),
        };
    }

    @Post(':id/close')
    async close(@Param('id') id: string) {
        const termination = terminationStore.get(id);
        if (!termination) throw new NotFoundException('Résiliation introuvable');
        if (!termination.canClose()) throw new BadRequestException('Checklist incomplète ou caution non traitée');

        const closed = termination.close();
        terminationStore.set(id, closed);

        // Free the property and terminate the contract
        const contract = await this.contractRepo.findById(termination.contractId);
        if (contract) {
            const terminatedContract = contract.terminate();
            await this.contractRepo.update(terminatedContract);

            const property = await this.propertyRepo.findById(contract.propertyId);
            if (property) {
                await this.propertyRepo.update(property.markVacant());
            }
        }

        return { id, status: closed.status, message: 'Résiliation clôturée' };
    }
}

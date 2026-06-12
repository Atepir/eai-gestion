import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Termination } from '../entities/termination.entity';
import { Contract } from '../entities/contract.entity';

@Injectable()
export class TerminationDomainService {
    initiate(contract: Contract, depositAmount?: number): Termination {
        if (!contract.isActive()) throw new Error('Le contrat doit être actif ou en préavis');

        const noticeDate = new Date();
        const endDate = new Date(noticeDate);
        endDate.setMonth(endDate.getMonth() + 3);

        return Termination.create({
            id: randomUUID(),
            contractId: contract.id,
            noticeDate,
            endDate,
            depositAmount,
        });
    }
}

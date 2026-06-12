import { Module } from '@nestjs/common';
import { OwnersController } from './owners.controller';
import { CreateOwnerCommand } from '../../../application/commands/create-owner.command';
import { UpdateOwnerCommand } from '../../../application/commands/update-owner.command';
import { DeleteOwnerCommand } from '../../../application/commands/delete-owner.command';
import { ListOwnersQuery } from '../../../application/queries/list-owners.query';
import { GetOwnerQuery } from '../../../application/queries/get-owner.query';

@Module({
    controllers: [OwnersController],
    providers: [
        CreateOwnerCommand,
        UpdateOwnerCommand,
        DeleteOwnerCommand,
        ListOwnersQuery,
        GetOwnerQuery,
    ],
})
export class OwnerModule { }

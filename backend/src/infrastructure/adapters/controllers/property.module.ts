import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { CreatePropertyCommand } from '../../../application/commands/create-property.command';
import { UpdatePropertyCommand } from '../../../application/commands/update-property.command';
import { DeletePropertyCommand } from '../../../application/commands/delete-property.command';
import { ListPropertiesQuery } from '../../../application/queries/list-properties.query';
import { GetPropertyQuery } from '../../../application/queries/get-property.query';

@Module({
    controllers: [PropertiesController],
    providers: [CreatePropertyCommand, UpdatePropertyCommand, DeletePropertyCommand, ListPropertiesQuery, GetPropertyQuery],
})
export class PropertyModule { }

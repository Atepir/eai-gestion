import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardQuery } from '../../../application/queries/dashboard.query';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
    constructor(private readonly dashboardQuery: DashboardQuery) { }

    @Get()
    async getDashboard(@CurrentUser() user: RequestUser) {
        return this.dashboardQuery.execute(user.role === 'ADMIN' ? undefined : user.ownerId);
    }
}

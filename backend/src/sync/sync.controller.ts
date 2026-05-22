import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { SyncService } from './sync.service';

@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Get('pull')
  pull(
    @Query('lastPulledAt') lastPulledAt: string,
    @CurrentUser() user: AuthUser,
  ) {
    const ts = lastPulledAt ? Number(lastPulledAt) : null;
    return this.sync.pull(ts, user);
  }

  @Post('push')
  push(@Body() body: any, @CurrentUser() user: AuthUser) {
    return this.sync.push(body, user);
  }
}

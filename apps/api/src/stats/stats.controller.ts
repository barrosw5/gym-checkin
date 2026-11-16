import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { statsQuerySchema, type StatsQuery } from '@gym-checkin/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { StatsService } from './stats.service.js';

@Controller('stats')
// Any signed-in role: residents plan their visit, staff read the trends.
// Not public: only aggregates, but still the residence's own data
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('summary')
  summary(@Query(new ZodValidationPipe(statsQuerySchema)) { range }: StatsQuery) {
    return this.stats.summary(range);
  }
}

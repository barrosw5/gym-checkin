import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

// Public on purpose (Render's health check): not in the docs
@ApiExcludeController()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { ok: true };
  }
}

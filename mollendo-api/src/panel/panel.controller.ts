import { Controller, Get } from '@nestjs/common';
import { PanelService } from './panel.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller()
export class PanelController {
  constructor(
    private readonly panelService: PanelService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('panel/resumen')
  @Roles('administracion', 'vigilancia')
  resumen() {
    return this.panelService.resumen();
  }

  // Usado por el servidor local/PC de vigilancia para detectar cuándo el
  // servidor central no responde y activar el modo contingencia (spec 9.9).
  @Get('health')
  @Public()
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      return { status: 'degraded', database: 'down' };
    }
  }
}

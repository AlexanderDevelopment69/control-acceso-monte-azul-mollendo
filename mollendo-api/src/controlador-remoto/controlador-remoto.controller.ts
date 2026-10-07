import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';

@Controller('controlador')
export class ControladorRemotoController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Padrón para el controlador de garita: los documentos de todo el personal
   * registrado (también los dados de baja: la salida no exige estar activo).
   * Sin internet, el controlador deja salir solo a quienes están aquí.
   */
  @Get('padron')
  @Public()
  @UseGuards(ApiKeyGuard)
  async padron() {
    const personas = await this.prisma.persona.findMany({ select: { numeroDocumento: true } });
    return { generado: new Date().toISOString(), documentos: personas.map((p) => p.numeroDocumento) };
  }
}

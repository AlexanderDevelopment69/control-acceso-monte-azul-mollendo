import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { ControladorGateway } from './controlador.gateway.js';
import { ReiniciarControladorDto } from './reiniciar-controlador.dto.js';

@Controller('controlador')
export class ControladorRemotoController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly controlador: ControladorGateway,
    private readonly auditoria: AuditoriaService,
  ) {}

  /**
   * Lista del personal para el controlador: los documentos de todo el personal
   * registrado (también los dados de baja: la salida no exige estar activo).
   * Sin internet, el controlador deja salir solo a quienes están aquí.
   */
  @Get('lista-personal')
  @Public()
  @UseGuards(ApiKeyGuard)
  async listaPersonal() {
    const personas = await this.prisma.persona.findMany({ select: { numeroDocumento: true } });
    return { generado: new Date().toISOString(), documentos: personas.map((p) => p.numeroDocumento) };
  }

  /** Reinicia el Controlador (PC) (botón de "Sistema y APIs"); queda en la Auditoría con el motivo. */
  @Post('reiniciar')
  @Roles('administrador', 'soporte')
  async reiniciar(@Body() dto: ReiniciarControladorDto, @CurrentUser() usuario: AuthenticatedUser) {
    const { enviado, error } = await this.controlador.reiniciar();
    if (!enviado) throw new BadRequestException(error);
    await this.auditoria.registrar({
      usuarioId: usuario.id,
      tablaAfectada: 'controlador',
      registroId: 0,
      accion: 'ejecucion',
      detalle: `Reinicio del Controlador (PC) · Motivo: ${dto.motivo.trim()}`,
    });
    return { enviado };
  }
}

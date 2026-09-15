import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AccionAuditoria } from '../generated/prisma/enums.js';

interface RegistrarAuditoriaParams {
  usuarioId: number | null;
  tablaAfectada: string;
  registroId: number;
  accion: AccionAuditoria;
}

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(params: RegistrarAuditoriaParams): Promise<void> {
    await this.prisma.auditoria.create({ data: params });
  }

  async findAll(filtros: { tablaAfectada?: string; registroId?: number }) {
    return this.prisma.auditoria.findMany({
      where: {
        tablaAfectada: filtros.tablaAfectada,
        registroId: filtros.registroId,
      },
      include: { usuario: { select: { id: true, correo: true, rol: true } } },
      orderBy: { fechaHora: 'desc' },
      take: 200,
    });
  }
}

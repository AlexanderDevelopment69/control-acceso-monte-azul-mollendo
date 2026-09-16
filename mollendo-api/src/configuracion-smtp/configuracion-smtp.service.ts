import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { UpdateConfiguracionSmtpDto } from './dto/update-configuracion-smtp.dto.js';

const ID_FILA_UNICA = 1;

export interface ConfigTransporteSmtp {
  host: string;
  puerto: number;
  seguro: boolean;
  usuario?: string;
  password?: string;
  remitente: string;
}

@Injectable()
export class ConfiguracionSmtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // Expuesto por el controller — nunca incluye la contraseña en texto plano,
  // solo si hay una guardada o no (para que el formulario sepa si mostrar
  // "contraseña configurada" en vez de un campo vacío). Devuelve siempre un
  // objeto (nunca null): NestJS/Express responde con el cuerpo vacío para un
  // controller que retorna null, y eso rompe un `res.json()` del lado del
  // cliente — más simple que el cliente tenga que manejar cuerpos vacíos.
  async obtener() {
    const fila = await this.prisma.configuracionSmtp.findUnique({ where: { id: ID_FILA_UNICA } });
    if (!fila) return { configurado: false as const };
    const { password: _password, ...resto } = fila;
    return { configurado: true as const, ...resto, passwordConfigurada: !!fila.password };
  }

  async guardar(dto: UpdateConfiguracionSmtpDto, usuarioId: number) {
    const existente = await this.prisma.configuracionSmtp.findUnique({ where: { id: ID_FILA_UNICA } });

    const fila = await this.prisma.configuracionSmtp.upsert({
      where: { id: ID_FILA_UNICA },
      create: {
        id: ID_FILA_UNICA,
        host: dto.host,
        puerto: dto.puerto,
        seguro: dto.seguro ?? false,
        usuario: dto.usuario,
        password: dto.password,
        remitente: dto.remitente,
      },
      update: {
        host: dto.host,
        puerto: dto.puerto,
        seguro: dto.seguro ?? false,
        usuario: dto.usuario,
        // Si no mandan una contraseña nueva, se conserva la que ya había —
        // el formulario nunca recibe la contraseña guardada, así que no
        // reenviarla no debe borrarla.
        password: dto.password ?? existente?.password,
        remitente: dto.remitente,
      },
    });

    await this.auditoriaService.registrar({
      usuarioId,
      tablaAfectada: 'configuracion_smtp',
      registroId: fila.id,
      accion: existente ? 'modificar' : 'crear',
    });

    const { password: _password, ...resto } = fila;
    return { configurado: true as const, ...resto, passwordConfigurada: !!fila.password };
  }

  // Vuelve a depender de las variables de entorno (o de nada, si tampoco
  // están configuradas) — no es un "borrado" en el sentido usual del
  // sistema, es la fila única de configuración, así que no pasa por
  // auditoría de la misma forma que las demás entidades.
  async eliminar() {
    await this.prisma.configuracionSmtp.deleteMany({ where: { id: ID_FILA_UNICA } });
    return { eliminado: true };
  }

  // Usado internamente por MailerService — la config guardada en la base
  // tiene prioridad; si no hay ninguna fila, cae a las variables de entorno
  // (comportamiento original, spec sección 10: "configurable por variable de
  // entorno").
  async obtenerConfigTransporte(): Promise<ConfigTransporteSmtp | null> {
    const fila = await this.prisma.configuracionSmtp.findUnique({ where: { id: ID_FILA_UNICA } });
    if (fila) {
      return {
        host: fila.host,
        puerto: fila.puerto,
        seguro: fila.seguro,
        usuario: fila.usuario ?? undefined,
        password: fila.password ?? undefined,
        remitente: fila.remitente,
      };
    }

    if (!process.env.SMTP_HOST) return null;
    return {
      host: process.env.SMTP_HOST,
      puerto: Number(process.env.SMTP_PORT ?? 587),
      seguro: false,
      usuario: process.env.SMTP_USER,
      password: process.env.SMTP_PASS,
      remitente: process.env.SMTP_FROM ?? 'no-reply@mollendo.local',
    };
  }
}

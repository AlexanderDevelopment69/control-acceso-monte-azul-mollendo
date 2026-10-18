import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

const CLAVE = 'orden_ingreso';
const FACIAL_PRIMERO = 'facial-primero';

/** ¿Está activo el orden "facial primero"? (para quien no puede inyectar el servicio, como IntegracionesModule). */
export async function leerFacialPrimero(prisma: Pick<PrismaService, 'ajusteSistema'>): Promise<boolean> {
  return (await prisma.ajusteSistema.findUnique({ where: { clave: CLAVE } }))?.valor === FACIAL_PRIMERO;
}

/**
 * Pedido a la integración del G4 Pro: dar (o quitar) el permiso de paso fijo
 * a estos documentos, todos juntos (lo atiende IntegracionesModule).
 */
export interface PermisosFijosEvent {
  documentos: string[];
  habilitar: boolean;
}

/** Orden del ingreso vigente, para "Sistema y APIs" y el Panel de vigilancia. */
export interface EstadoModoIngreso {
  /** true: primero rostro y alcohol en el G4 Pro, al final el DNI (en prueba). false: primero el DNI (normal). */
  facialPrimero: boolean;
  desde: string | null;
  cambiadoPor: string | null;
}

/**
 * Orden del ingreso (pedido de TMAM, 17/10/2026). Normal: primero el DNI y
 * después rostro y alcohol. "Facial primero": todo el personal activo tiene
 * permiso fijo en el G4 Pro; hace rostro y alcohol y al final pasa su DNI
 * (ver EventosAccesoService.registrarDniAlFinal). Al activarlo se da el
 * permiso a todo el personal activo; al apagarlo se le quita a todos. Lo
 * cambia el administrador; cada cambio queda en la auditoría.
 */
@Injectable()
export class ModoIngresoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  facialPrimero(): Promise<boolean> {
    return leerFacialPrimero(this.prisma);
  }

  async estado(): Promise<EstadoModoIngreso> {
    const ajuste = await this.prisma.ajusteSistema.findUnique({ where: { clave: CLAVE } });
    return {
      facialPrimero: ajuste?.valor === FACIAL_PRIMERO,
      desde: ajuste?.modificadoEn.toISOString() ?? null,
      cambiadoPor: ajuste?.modificadoPor ?? null,
    };
  }

  async cambiar(facialPrimero: boolean, usuario: AuthenticatedUser): Promise<EstadoModoIngreso> {
    const valor = facialPrimero ? FACIAL_PRIMERO : 'dni-primero';
    const ajuste = await this.prisma.ajusteSistema.upsert({
      where: { clave: CLAVE },
      create: { clave: CLAVE, valor, modificadoPor: usuario.correo },
      update: { valor, modificadoPor: usuario.correo },
    });
    await this.auditoria.registrar({ usuarioId: usuario.id, tablaAfectada: 'ajuste_sistema', registroId: ajuste.id, accion: 'modificar' });
    // Activar: permiso fijo al personal activo. Apagar: se le quita a todos (vuelve a darse solo con el DNI).
    // Se envía siempre (repetirlo no cambia nada): así se puede volver a aplicar guardando de nuevo.
    const personas = await this.prisma.persona.findMany({
      where: facialPrimero ? { estado: 'activo' } : {},
      select: { numeroDocumento: true },
    });
    this.eventEmitter.emit('g4pro.permisos-fijos', {
      documentos: personas.map((p) => p.numeroDocumento),
      habilitar: facialPrimero,
    } satisfies PermisosFijosEvent);
    const estado = await this.estado();
    this.eventEmitter.emit('modo-ingreso.cambio', estado);
    return estado;
  }
}

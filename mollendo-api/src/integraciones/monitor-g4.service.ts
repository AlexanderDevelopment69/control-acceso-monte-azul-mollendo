import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { alcoholConforme, leerRegistroAsistencia } from '../push-sdk/asistencia.util.js';
import { motivosEvento } from '../reportes/reportes.service.js';

/** Una prueba del G4 Pro (rostro y alcohol) para el monitor de Sistema y APIs. */
export interface MarcacionG4 {
  id: number;
  serialNumber: string;
  /** Número de la marcación en el equipo (sube de uno en uno). */
  numero: number | null;
  /** Pruebas que no llegaron entre la anterior y esta (salto en el número). */
  faltanAntes: number;
  dni: string | null;
  persona: { id: number; nombres: string; apellidos: string; tieneFoto: boolean } | null;
  /** Hora de la prueba según el reloj del equipo. */
  horaPrueba: string | null;
  /** Hora en que llegó al servidor. */
  llegada: string;
  /** Segundos entre la prueba y su llegada. */
  demoraSegundos: number | null;
  alcohol: string | null;
  aprobado: boolean | null;
  /** Qué hizo el sistema con la prueba al llegar. */
  decision: string | null;
  /** El ingreso en que terminó, si terminó en uno. */
  ingreso: { id: number; resultado: string; motivo: string; fechaHora: string } | null;
}

/**
 * Monitor en vivo del G4 Pro en asistencia: las últimas pruebas que mandó
 * (`ATTLOG`), con quién la hizo, cuánto tardó en llegar, el grado y qué hizo
 * el sistema con ella. Reemplaza leer el log de la API con la depuración.
 */
@Injectable()
export class MonitorG4Service {
  constructor(private readonly prisma: PrismaService) {}

  async ultimas(limite = 30): Promise<MarcacionG4[]> {
    // Una de más, para saber si falta alguna antes de la más antigua que se muestra.
    const filas = await this.prisma.verificacionDispositivo.findMany({
      where: { tabla: 'attlog' },
      orderBy: { id: 'desc' },
      take: limite + 1,
      include: { dispositivo: { select: { serialNumber: true } }, eventoAcceso: true },
    });
    const registros = filas.map((f) => leerRegistroAsistencia(f.crudo));
    const dnis = [...new Set(registros.map((r) => r?.pin).filter((p): p is string => !!p))];
    const personas = await this.prisma.persona.findMany({
      where: { numeroDocumento: { in: dnis } },
      select: { id: true, numeroDocumento: true, nombres: true, apellidos: true, fotoUrl: true },
    });
    const porDni = new Map(personas.map((p) => [p.numeroDocumento, p]));

    return filas.slice(0, limite).map((f, i) => {
      const registro = registros[i];
      const persona = registro ? porDni.get(registro.pin) : undefined;
      const anterior = filas.slice(i + 1).findIndex((o) => o.dispositivoId === f.dispositivoId);
      const numeroAnterior = anterior >= 0 ? (registros[i + 1 + anterior]?.numero ?? null) : null;
      const numero = registro?.numero ?? null;
      const evento = f.eventoAcceso;
      return {
        id: f.id,
        serialNumber: f.dispositivo.serialNumber,
        numero,
        faltanAntes: numero !== null && numeroAnterior !== null && numero > numeroAnterior + 1 ? numero - numeroAnterior - 1 : 0,
        dni: registro?.pin ?? null,
        persona: persona
          ? { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos, tieneFoto: !!persona.fotoUrl }
          : null,
        horaPrueba: f.horaDispositivo?.toISOString() ?? null,
        llegada: f.creadoEn.toISOString(),
        demoraSegundos: f.horaDispositivo ? Math.round((f.creadoEn.getTime() - f.horaDispositivo.getTime()) / 1000) : null,
        alcohol: registro?.alcohol ?? null,
        aprobado: registro?.alcohol ? alcoholConforme(registro.alcohol) : null,
        decision: f.decision,
        ingreso: evento
          ? { id: evento.id, resultado: evento.resultado, motivo: motivosEvento(evento), fechaHora: evento.fechaHora.toISOString() }
          : null,
      };
    });
  }
}

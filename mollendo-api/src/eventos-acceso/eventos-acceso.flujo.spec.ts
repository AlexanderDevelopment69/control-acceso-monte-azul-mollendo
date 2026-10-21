/**
 * Flujo del ingreso con el G4 Pro (diagrama de ingreso): habilitación de una
 * persona a la vez, cola, resultado del equipo (rtlog), vencimiento y relé.
 * Usa una base de datos falsa en memoria con solo las consultas que necesita
 * EventosAccesoService, y un reloj controlado.
 */
import { EventosAccesoService } from './eventos-acceso.service.js';
import type { AttlogRecibidoEvent, RtlogRecibidoEvent } from '../push-sdk/push-sdk.service.js';

type Fila = Record<string, unknown> & { id: number };

const TARJETA = 'TMAM-CONT-ABCDEFGHIJKLMNOPQRST';
const TARJETA_DESACTIVADA = 'TMAM-CONT-ZZZZZZZZZZZZZZZZZZZZ';

/** ¿La fila cumple el `where` de Prisma? (solo lo que usa el servicio). */
function cumple(fila: Fila, where: Record<string, unknown> = {}): boolean {
  return Object.entries(where).every(([campo, condicion]) => {
    if (campo === 'OR') return (condicion as Record<string, unknown>[]).some((c) => cumple(fila, c));
    const valor = fila[campo];
    if (condicion === null) return valor === null || valor === undefined;
    if (condicion instanceof Date) return valor instanceof Date && valor.getTime() === condicion.getTime();
    if (typeof condicion === 'object') {
      const c = condicion as { gte?: Date; lt?: Date; not?: unknown };
      if (valor === null || valor === undefined) return false;
      const t = (valor as Date).getTime();
      if (c.gte && t < c.gte.getTime()) return false;
      if (c.lt && t >= c.lt.getTime()) return false;
      return true;
    }
    return valor === condicion;
  });
}

function crearBaseFalsa() {
  const personas: Fila[] = [];
  const documentos: Fila[] = [];
  const pendientes: Fila[] = [];
  const eventos: Fila[] = [];
  const ajustes: Record<string, string> = {};
  let siguienteId = 1;

  const conPersona = (p: Fila) => {
    const persona = personas.find((x) => x.id === p.personaId)!;
    return { ...p, persona: { ...persona, empresa: { razonSocial: 'Empresa de prueba S.A.C.' } } };
  };
  const ordenar = (filas: Fila[], orderBy?: { creadoEn?: 'asc' | 'desc' }) => {
    if (!orderBy?.creadoEn) return filas;
    const signo = orderBy.creadoEn === 'asc' ? 1 : -1;
    return [...filas].sort((a, b) => signo * ((a.creadoEn as Date).getTime() - (b.creadoEn as Date).getTime()));
  };

  const prisma = {
    persona: {
      findUnique: async ({ where }: { where: { id?: number; tipoDocumentoIdentidad_numeroDocumento?: { numeroDocumento: string } } }) =>
        personas.find((p) =>
          where.id !== undefined ? p.id === where.id : p.numeroDocumento === where.tipoDocumentoIdentidad_numeroDocumento!.numeroDocumento,
        ) ?? null,
      findFirst: async ({ where }: { where: { numeroDocumento: string } }) => personas.find((p) => p.numeroDocumento === where.numeroDocumento) ?? null,
    },
    // Variante del G4 Pro (protocolo-g4.ts): asistencia si `ajustes.protocolo_g4 === 'asistencia'`.
    ajusteSistema: {
      findUnique: async ({ where }: { where: { clave: string } }) => (ajustes[where.clave] ? { valor: ajustes[where.clave] } : null),
    },
    documentoPersona: {
      findMany: async ({ where }: { where: { personaId: number } }) => documentos.filter((d) => d.personaId === where.personaId),
    },
    ingresoPendiente: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const fila: Fila = { id: siguienteId++, creadoEn: new Date(), consumidoEn: null, habilitadoEn: null, torniqueteId: null, manual: false, ...data };
        pendientes.push(fila);
        return conPersona(fila);
      },
      findFirst: async (args: { where?: Record<string, unknown>; orderBy?: { creadoEn?: 'asc' | 'desc' } }) => {
        const fila = ordenar(pendientes.filter((p) => cumple(p, args.where)), args.orderBy)[0];
        return fila ? conPersona(fila) : null;
      },
      findMany: async (args: { where?: Record<string, unknown>; orderBy?: { creadoEn?: 'asc' | 'desc' } }) =>
        ordenar(pendientes.filter((p) => cumple(p, args.where)), args.orderBy).map(conPersona),
      update: async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
        const fila = pendientes.find((p) => p.id === where.id)!;
        Object.assign(fila, data);
        return conPersona(fila);
      },
    },
    eventoAcceso: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const fila: Fila = { id: siguienteId++, fechaHora: new Date(), ...data };
        eventos.push(fila);
        return fila;
      },
      // Último movimiento (antipassback): el más reciente por fecha y, a igual fecha, por id.
      findFirst: async ({ where }: { where: Record<string, unknown> }) =>
        eventos
          .filter((e) => cumple(e, where))
          .sort((a, b) => (b.fechaHora as Date).getTime() - (a.fechaHora as Date).getTime() || b.id - a.id)[0] ?? null,
    },
    verificacionDispositivo: { update: async () => ({}) },
    $transaction: async (operaciones: Promise<unknown>[]) => Promise.all(operaciones),
  };

  return { prisma, personas, documentos, pendientes, eventos, ajustes };
}

/** Persona con un documento (vigente salvo que se indique). */
function agregarPersona(base: ReturnType<typeof crearBaseFalsa>, dni: string, opciones: { baja?: boolean; vencido?: boolean } = {}) {
  const id = base.personas.length + 100;
  base.personas.push({
    id,
    tipoDocumentoIdentidad: 'DNI',
    numeroDocumento: dni,
    nombres: `Persona ${dni}`,
    apellidos: 'Prueba',
    estado: opciones.baja ? 'inactivo' : 'activo',
    fotoUrl: null,
  });
  base.documentos.push({
    id: id + 1000,
    personaId: id,
    tipoDocumentoId: 1,
    version: 1,
    fechaVencimiento: opciones.vencido ? new Date('2026-01-01') : new Date('2030-12-31'),
    tipoDocumento: { nombre: 'SCTR' },
  });
  return id;
}

describe('Ingreso con el G4 Pro (habilitación, cola, resultado y vencimiento)', () => {
  let base: ReturnType<typeof crearBaseFalsa>;
  let emitidos: { evento: string; datos: Record<string, unknown> }[];
  let servicio: EventosAccesoService;
  let ahora: number;
  /** ¿Verificación manual activa? (contingencia por falla del equipo facial). */
  let manualActiva: boolean;
  /** ¿Orden "facial primero"? */
  let facialPrimero: boolean;
  /** Lo que responde el G4 Pro a "¿quién aprobó?" (rastreo VerifySuccess.txt). */
  let quienSoplo: Promise<unknown>;
  /** Cada vez que se pasó una tarjeta de contingencia (la TARJETA sirve; TARJETA_DESACTIVADA, no). */
  let usosTarjeta: Record<string, unknown>[];
  /** Puertas con el lector de DNI desconectado (contingencia "sin lector"). */
  let sinLector: { ingreso: boolean; salida: boolean };

  const ingreso = (dni: string) => servicio.registrarIngreso({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: dni, torniqueteId: 'Ingreso' });
  const salida = (dni: string) => servicio.registrarSalida({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: dni, torniqueteId: 'Salida' });
  const rtlog = (eventCode: string, pin = '0', horaDispositivo: Date | null = null) =>
    servicio.correlacionarVerificacionDispositivo({
      verificacionId: 1,
      serialNumber: 'HSR3263100192',
      horaDispositivo,
      eventCode,
      concentracion: '0',
      pin,
    } satisfies RtlogRecibidoEvent);
  const avanzar = (ms: number) => {
    ahora += ms;
    vi.setSystemTime(ahora);
  };
  /** La persona ya está dentro: un ingreso autorizado de hace una hora. */
  const yaIngreso = (dni: string) => {
    const persona = base.personas.find((p) => p.numeroDocumento === dni)!;
    base.eventos.push({
      id: 9000 + base.eventos.length,
      personaId: persona.id,
      numeroDocumento: dni,
      tipoMovimiento: 'ingreso',
      resultado: 'autorizado',
      fechaHora: new Date(ahora - 3_600_000),
    });
  };
  const vencidos = () => (servicio as unknown as { cerrarVencidos: () => Promise<void> }).cerrarVencidos();
  const de = (evento: string) => emitidos.filter((e) => e.evento === evento).map((e) => e.datos);

  beforeEach(() => {
    ahora = new Date('2026-10-05T12:00:00Z').getTime();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(ahora);
    base = crearBaseFalsa();
    emitidos = [];
    quienSoplo = Promise.resolve(null);
    const eventEmitter = {
      emit: (evento: string, datos: Record<string, unknown>) => emitidos.push({ evento, datos }),
      emitAsync: async (evento: string, datos: Record<string, unknown>) => {
        emitidos.push({ evento, datos });
        return evento === 'g4pro.quien-aprobo' ? [await quienSoplo] : [];
      },
    };
    manualActiva = false;
    facialPrimero = false;
    servicio = new EventosAccesoService(
      base.prisma as never,
      eventEmitter as never,
      { activa: async () => manualActiva } as never,
      { registrar: async () => undefined } as never,
      { facialPrimero: async () => facialPrimero } as never,
      {
        revisar: async (codigo: string) =>
          codigo === TARJETA ? { tarjeta: { id: 1, numero: 1 } } : { rechazo: 'Tarjeta desactivada', tarjetaId: 2 },
        anotarUso: async (uso: Record<string, unknown>) => void usosTarjeta.push(uso),
      } as never,
      { sinLector: () => sinLector } as never,
    );
    sinLector = { ingreso: false, salida: false };
    usosTarjeta = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('DNI en regla y nadie en su turno: se lo habilita en el G4 Pro', async () => {
    agregarPersona(base, '11111111');
    const r = await ingreso('11111111');
    expect(r).toMatchObject({ estado: 'pendiente_verificacion' });
    expect(de('g4pro.habilitar')).toEqual([{ numeroDocumento: '11111111', habilitar: true }]);
    expect(de('ingreso.en-espera')).toHaveLength(1);
    expect(de('ingreso.en-espera')[0]).toMatchObject({ numeroDocumento: '11111111', enCola: false });
    expect(base.eventos).toHaveLength(0);
  });

  it('se habilita a una persona a la vez: la segunda queda en cola', async () => {
    agregarPersona(base, '11111111');
    agregarPersona(base, '22222222');
    await ingreso('11111111');
    avanzar(5000);
    await ingreso('22222222');
    expect(de('g4pro.habilitar')).toEqual([{ numeroDocumento: '11111111', habilitar: true }]);
    const espera = de('ingreso.en-espera');
    expect(espera[1]).toMatchObject({ numeroDocumento: '22222222', enCola: true, hasta: null });
  });

  it('si la misma persona vuelve a pasar su DNI mientras espera, mantiene su lugar', async () => {
    agregarPersona(base, '11111111');
    await ingreso('11111111');
    await ingreso('11111111');
    expect(base.pendientes).toHaveLength(1);
    expect(de('g4pro.habilitar')).toHaveLength(1);
  });

  it('event=0: ingreso autorizado, relé de ingreso, se le quita el permiso y pasa el siguiente', async () => {
    agregarPersona(base, '11111111');
    agregarPersona(base, '22222222');
    await ingreso('11111111');
    await ingreso('22222222');
    await rtlog('0');
    expect(base.eventos).toHaveLength(1);
    expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'autorizado', denegadoPorAlcohol: false });
    expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'ingreso' })]);
    expect(de('g4pro.habilitar')).toEqual([
      { numeroDocumento: '11111111', habilitar: true },
      { numeroDocumento: '11111111', habilitar: false },
      { numeroDocumento: '22222222', habilitar: true },
    ]);
  });

  it('event=1: denegado por alcohol, sin relé', async () => {
    agregarPersona(base, '11111111');
    await ingreso('11111111');
    await rtlog('1');
    expect(base.eventos[0]).toMatchObject({ resultado: 'denegado', denegadoPorAlcohol: true });
    expect(de('molinete.abrir')).toHaveLength(0);
    expect(de('g4pro.habilitar').at(-1)).toEqual({ numeroDocumento: '11111111', habilitar: false });
  });

  it('código desconocido: se deniega por alcohol (ante la duda, no se abre)', async () => {
    agregarPersona(base, '11111111');
    await ingreso('11111111');
    await rtlog('99');
    expect(base.eventos[0]).toMatchObject({ resultado: 'denegado', denegadoPorAlcohol: true });
    expect(de('molinete.abrir')).toHaveLength(0);
  });

  it('event=23 (otra persona sin permiso) y event=27 (no registrado) no cierran la espera', async () => {
    agregarPersona(base, '11111111');
    await ingreso('11111111');
    await rtlog('23', '33333333');
    await rtlog('27');
    expect(base.eventos).toHaveLength(0);
    expect(base.pendientes[0].consumidoEn).toBeNull();
    expect(de('molinete.abrir')).toHaveLength(0);
  });

  it('un resultado del equipo sin nadie habilitado se ignora (no abre)', async () => {
    await rtlog('0');
    expect(base.eventos).toHaveLength(0);
    expect(de('molinete.abrir')).toHaveLength(0);
  });

  it('si no completa rostro y alcohol en 1 minuto: "No completó rostro y alcohol" y pasa el siguiente', async () => {
    agregarPersona(base, '11111111');
    agregarPersona(base, '22222222');
    await ingreso('11111111');
    await ingreso('22222222');
    avanzar(59_000);
    await vencidos();
    expect(base.eventos).toHaveLength(0);
    avanzar(2_000);
    await vencidos();
    expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'denegado', denegadoSinVerificacion: true });
    expect(de('molinete.abrir')).toHaveLength(0);
    expect(de('g4pro.habilitar').slice(-2)).toEqual([
      { numeroDocumento: '11111111', habilitar: false },
      { numeroDocumento: '22222222', habilitar: true },
    ]);
  });

  it('en cola más de 3 minutos: se cierra sin verificar', async () => {
    agregarPersona(base, '11111111');
    agregarPersona(base, '22222222');
    await ingreso('11111111');
    await ingreso('22222222');
    // La primera nunca termina y su minuto se renueva a mano para que la segunda no avance.
    avanzar(3 * 60_000 + 1000);
    base.pendientes[0].habilitadoEn = new Date(ahora);
    await vencidos();
    const segunda = base.eventos.find((e) => e.numeroDocumento === '22222222');
    expect(segunda).toMatchObject({ resultado: 'denegado', denegadoSinVerificacion: true });
  });

  it('dado de baja, con documento vencido o no registrado: se deniega al instante, sin habilitar', async () => {
    agregarPersona(base, '44444444', { baja: true });
    agregarPersona(base, '55555555', { vencido: true });
    await ingreso('44444444');
    await ingreso('55555555');
    await ingreso('99999999');
    expect(base.eventos.map((e) => [e.numeroDocumento, e.resultado])).toEqual([
      ['44444444', 'denegado'],
      ['55555555', 'denegado'],
      ['99999999', 'denegado'],
    ]);
    expect(base.eventos[0]).toMatchObject({ denegadoPorBaja: true });
    expect(base.eventos[1]).toMatchObject({ denegadoPorDocumentos: true });
    expect(base.eventos[2]).toMatchObject({ denegadoNoRegistrado: true });
    expect(de('g4pro.habilitar')).toHaveLength(0);
    expect(base.pendientes).toHaveLength(0);
  });

  describe('Salida (solo DNI, diagrama de salida)', () => {
    it('persona registrada que ingresó: salida autorizada y relé de salida, sin pasar por el G4 Pro', async () => {
      agregarPersona(base, '11111111');
      yaIngreso('11111111');
      const r = await salida('11111111');
      expect(r).toMatchObject({ tipoMovimiento: 'salida', resultado: 'autorizado', numeroDocumento: '11111111' });
      expect(base.eventos.at(-1)).toEqual(expect.objectContaining({ tipoMovimiento: 'salida', resultado: 'autorizado', torniqueteId: 'Salida' }));
      expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'salida', torniqueteId: 'Salida' })]);
      expect(de('evento-acceso.registrado')).toHaveLength(1);
      expect(de('g4pro.habilitar')).toHaveLength(0);
      expect(base.pendientes).toHaveLength(0);
    });

    it('dado de baja o con documentos vencidos: si ingresó, igual sale', async () => {
      agregarPersona(base, '44444444', { baja: true });
      agregarPersona(base, '55555555', { vencido: true });
      yaIngreso('44444444');
      yaIngreso('55555555');
      await salida('44444444');
      await salida('55555555');
      expect(base.eventos.slice(2).map((e) => e.resultado)).toEqual(['autorizado', 'autorizado']);
      expect(de('molinete.abrir')).toHaveLength(2);
    });

    it('no registrado: salida denegada, sin relé', async () => {
      const r = await salida('99999999');
      expect(r).toMatchObject({ tipoMovimiento: 'salida', resultado: 'denegado', motivos: { personaNoRegistrada: true } });
      expect(base.eventos[0]).toMatchObject({ tipoMovimiento: 'salida', denegadoNoRegistrado: true });
      expect(de('molinete.abrir')).toHaveLength(0);
      expect(de('evento-acceso.registrado')).toHaveLength(1);
    });

    it('una salida no afecta a quien espera en el ingreso', async () => {
      agregarPersona(base, '11111111');
      agregarPersona(base, '22222222');
      yaIngreso('22222222');
      await ingreso('11111111');
      await salida('22222222');
      expect(base.pendientes[0].consumidoEn).toBeNull();
      await rtlog('0');
      expect(base.eventos.slice(1).map((e) => [e.numeroDocumento, e.tipoMovimiento, e.resultado])).toEqual([
        ['22222222', 'salida', 'autorizado'],
        ['11111111', 'ingreso', 'autorizado'],
      ]);
      expect(de('molinete.abrir').map((e) => e.tipoMovimiento)).toEqual(['salida', 'ingreso']);
    });
  });

  describe('verificación manual (equipo facial fuera de servicio)', () => {
    const vigilante = { id: 2, empresaId: 1, rol: 'vigilancia', correo: 'vigilancia@mollendo.local' } as const;
    const decidir = (decision: 'apto' | 'alcohol' | 'no-es-la-persona', id = base.pendientes[0].id) =>
      servicio.decidirManual(id, decision, vigilante as never);

    beforeEach(() => {
      manualActiva = true;
    });

    it('DNI en regla: queda esperando al vigilante y no se manda nada al G4 Pro', async () => {
      agregarPersona(base, '11111111');
      const r = await ingreso('11111111');
      expect(r).toMatchObject({ estado: 'pendiente_verificacion', mensaje: expect.stringContaining('Verificación manual') });
      expect(de('g4pro.habilitar')).toHaveLength(0);
      expect(de('ingreso.en-espera')[0]).toMatchObject({ numeroDocumento: '11111111', enCola: false, manual: true });
    });

    it('"Apto: abrir": ingreso autorizado, marcado como manual con el vigilante, y se abre el molinete', async () => {
      agregarPersona(base, '11111111');
      await ingreso('11111111');
      await decidir('apto');
      expect(base.eventos[0]).toMatchObject({ resultado: 'autorizado', verificacionManual: true, verificadoPorId: 2 });
      expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'ingreso' })]);
      expect(de('evento-acceso.registrado')[0]).toMatchObject({ verificacionManual: true, verificadoPor: 'vigilancia@mollendo.local' });
      expect(de('g4pro.habilitar')).toHaveLength(0); // tampoco se manda "quitar permiso"
    });

    it('"Alcohol: no apto" y "No es la persona": denegados, sin molinete', async () => {
      agregarPersona(base, '11111111');
      agregarPersona(base, '22222222');
      await ingreso('11111111');
      await ingreso('22222222');
      await decidir('alcohol', base.pendientes[0].id);
      await decidir('no-es-la-persona', base.pendientes[1].id);
      expect(base.eventos.map((e) => [e.resultado, e.denegadoPorAlcohol, e.denegadoRostroNoCoincide])).toEqual([
        ['denegado', true, false],
        ['denegado', false, true],
      ]);
      expect(de('molinete.abrir')).toHaveLength(0);
      expect(de('evento-acceso.registrado')[1]).toMatchObject({ motivos: { rostroNoCoincide: true } });
    });

    it('de una persona a la vez: la segunda espera su turno y no se puede decidir antes', async () => {
      agregarPersona(base, '11111111');
      agregarPersona(base, '22222222');
      await ingreso('11111111');
      await ingreso('22222222');
      expect(de('ingreso.en-espera')[1]).toMatchObject({ numeroDocumento: '22222222', enCola: true });
      await expect(decidir('apto', base.pendientes[1].id)).rejects.toThrow(/ya no está esperando/);
      await decidir('apto', base.pendientes[0].id);
      await decidir('apto', base.pendientes[1].id);
      expect(base.eventos.map((e) => e.numeroDocumento)).toEqual(['11111111', '22222222']);
    });

    it('el vigilante tiene 2 minutos: al minuto sigue esperando, a los 2 se deniega', async () => {
      agregarPersona(base, '11111111');
      await ingreso('11111111');
      avanzar(61_000);
      await vencidos();
      expect(base.eventos).toHaveLength(0);
      avanzar(60_000);
      await vencidos();
      expect(base.eventos[0]).toMatchObject({ resultado: 'denegado', denegadoSinVerificacion: true, verificacionManual: true });
      await expect(decidir('apto')).rejects.toThrow(/ya no está esperando/);
    });

    it('lo que mande el G4 Pro no cierra una espera manual', async () => {
      agregarPersona(base, '11111111');
      await ingreso('11111111');
      await rtlog('0');
      expect(base.eventos).toHaveLength(0);
      expect(de('molinete.abrir')).toHaveLength(0);
    });

    it('una decisión no se aplica dos veces', async () => {
      agregarPersona(base, '11111111');
      await ingreso('11111111');
      await decidir('apto');
      await expect(decidir('apto')).rejects.toThrow(/ya no está esperando/);
      expect(base.eventos).toHaveLength(1);
    });
  });

  describe('Antipassback estricto', () => {
    it('no vuelve a ingresar sin registrar su salida: denegado "ya figura dentro", sin llegar al G4 Pro', async () => {
      agregarPersona(base, '11111111');
      yaIngreso('11111111');
      const r = await ingreso('11111111');
      expect(r).toMatchObject({ tipoMovimiento: 'ingreso', resultado: 'denegado', motivos: { yaDentro: true } });
      expect(base.eventos.at(-1)).toMatchObject({ tipoMovimiento: 'ingreso', resultado: 'denegado', denegadoYaDentro: true });
      expect(base.pendientes).toHaveLength(0);
      expect(de('g4pro.habilitar')).toHaveLength(0);
    });

    it('no sale sin un ingreso registrado: denegado "no registra ingreso" y no se abre', async () => {
      agregarPersona(base, '11111111');
      const r = await salida('11111111');
      expect(r).toMatchObject({ tipoMovimiento: 'salida', resultado: 'denegado', motivos: { sinIngreso: true } });
      expect(base.eventos).toEqual([expect.objectContaining({ tipoMovimiento: 'salida', resultado: 'denegado', denegadoSinIngreso: true })]);
      expect(de('molinete.abrir')).toHaveLength(0);
      expect(de('evento-acceso.registrado')).toEqual([expect.objectContaining({ resultado: 'denegado', tipoMovimiento: 'salida' })]);
    });

    it('tampoco sale dos veces seguidas', async () => {
      agregarPersona(base, '11111111');
      yaIngreso('11111111');
      expect(await salida('11111111')).toMatchObject({ resultado: 'autorizado' });
      avanzar(60_000);
      expect(await salida('11111111')).toMatchObject({ resultado: 'denegado', motivos: { sinIngreso: true } });
      expect(de('molinete.abrir')).toHaveLength(1);
    });

    it('sin conexión, la salida que el controlador ya dejó pasar se registra igual (no puede saber quién está dentro)', async () => {
      agregarPersona(base, '11111111');
      const r = await servicio.registrarSalida({
        tipoDocumentoIdentidad: 'DNI',
        numeroDocumento: '11111111',
        torniqueteId: 'Salida',
        sinConexion: true,
        fechaHora: new Date(ahora - 60_000).toISOString(),
      });
      expect(r).toMatchObject({ resultado: 'autorizado' });
      expect(de('molinete.abrir')).toHaveLength(0);
    });

    it('corrección manual: con la salida registrada a mano, vuelve a ingresar (sin abrir el molinete al corregir)', async () => {
      const id = agregarPersona(base, '11111111');
      yaIngreso('11111111');
      const vigilante = { id: 7, correo: 'vigilancia@mollendo.local', rol: 'vigilancia', empresaId: 1 } as never;
      await servicio.registrarCorreccion({ personaId: id, tipoMovimiento: 'salida', motivo: 'Emergencia: brazos liberados' }, vigilante);
      expect(base.eventos.at(-1)).toMatchObject({
        tipoMovimiento: 'salida',
        resultado: 'autorizado',
        correccionManual: true,
        motivoCorreccion: 'Emergencia: brazos liberados',
        verificadoPorId: 7,
      });
      expect(de('molinete.abrir')).toHaveLength(0);
      avanzar(1000);
      expect(await ingreso('11111111')).toMatchObject({ estado: 'pendiente_verificacion' });
    });

    it('corrección manual: con el ingreso registrado a mano, puede salir; y no corrige lo que ya está bien', async () => {
      const id = agregarPersona(base, '11111111');
      const admin = { id: 1, correo: 'admin@mollendo.local', rol: 'administrador', empresaId: 1 } as never;
      await expect(servicio.registrarCorreccion({ personaId: id, tipoMovimiento: 'salida', motivo: 'Prueba' }, admin)).rejects.toThrow(
        'ya figura fuera',
      );
      await servicio.registrarCorreccion({ personaId: id, tipoMovimiento: 'ingreso', motivo: 'Entró sin marcar' }, admin);
      await expect(servicio.registrarCorreccion({ personaId: id, tipoMovimiento: 'ingreso', motivo: 'Prueba' }, admin)).rejects.toThrow(
        'ya figura dentro',
      );
      avanzar(1000);
      expect(await salida('11111111')).toMatchObject({ resultado: 'autorizado' });
      expect(de('molinete.abrir')).toHaveLength(1);
    });
  });

  describe('orden "facial primero": permiso fijo, rostro y alcohol, y al final el DNI', () => {
    beforeEach(() => {
      facialPrimero = true;
    });

    it('aprueba y pasa su DNI en 20 s: se abre, marcado "facial primero", sin tocar permisos', async () => {
      agregarPersona(base, '11111111');
      await rtlog('0');
      expect(de('ingreso.en-espera')[0]).toMatchObject({ esperaDni: true, personaId: 0 });
      expect(await servicio.ingresosEnEspera()).toEqual([expect.objectContaining({ esperaDni: true })]);
      avanzar(15_000);
      const r = await ingreso('11111111');
      expect(r).toMatchObject({ resultado: 'autorizado', facialPrimero: true });
      expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'autorizado', facialPrimero: true });
      expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'ingreso' })]);
      expect(de('ingreso.espera-terminada')).toHaveLength(1);
      expect(de('g4pro.habilitar')).toHaveLength(0);
      expect(base.pendientes).toHaveLength(0);
    });

    it('DNI sin aprobación antes: "Sin rostro y alcohol"', async () => {
      agregarPersona(base, '11111111');
      expect(await ingreso('11111111')).toMatchObject({ resultado: 'denegado', motivos: { sinFacial: true } });
      expect(base.eventos[0]).toMatchObject({ denegadoSinFacial: true });
      expect(de('molinete.abrir')).toHaveLength(0);
    });

    it('nadie pasa su DNI en 20 s: denegado "No pasó su DNI a tiempo" sin persona; el DNI tardío no entra', async () => {
      agregarPersona(base, '11111111');
      await rtlog('0');
      avanzar(21_000);
      await vencidos();
      expect(base.eventos[0]).toMatchObject({ resultado: 'denegado', denegadoSinDni: true, facialPrimero: true });
      expect(base.eventos[0].personaId).toBeUndefined();
      expect(await ingreso('11111111')).toMatchObject({ resultado: 'denegado', motivos: { sinFacial: true } });
    });

    it('dos aprobaciones sin saber de quién son (el equipo no lo dijo): no se puede elegir', async () => {
      agregarPersona(base, '11111111');
      await rtlog('0');
      avanzar(3_000);
      await rtlog('0');
      expect(await ingreso('11111111')).toMatchObject({ resultado: 'denegado', motivos: { sinFacial: true } });
      expect(de('molinete.abrir')).toHaveLength(0);
    });

    it('una aprobación sirve para un solo DNI', async () => {
      agregarPersona(base, '11111111');
      agregarPersona(base, '22222222');
      await rtlog('0');
      expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado' });
      expect(await ingreso('22222222')).toMatchObject({ resultado: 'denegado', motivos: { sinFacial: true } });
    });

    it('no pasa el alcohol: denegado "Alcohol" sin persona (el equipo no dice quién)', async () => {
      await rtlog('1');
      expect(base.eventos[0]).toMatchObject({ tipoMovimiento: 'ingreso', resultado: 'denegado', denegadoPorAlcohol: true, facialPrimero: true });
      expect(de('molinete.abrir')).toHaveLength(0);
    });

    it('documentos vencidos o ya dentro: no abre, y la aprobación no queda para otro', async () => {
      agregarPersona(base, '55555555', { vencido: true });
      agregarPersona(base, '11111111');
      agregarPersona(base, '22222222');
      yaIngreso('22222222');
      await rtlog('0');
      expect(await ingreso('55555555')).toMatchObject({ resultado: 'denegado', motivos: { documentos: true } });
      expect(await ingreso('11111111')).toMatchObject({ resultado: 'denegado', motivos: { sinFacial: true } });
      await rtlog('0');
      expect(await ingreso('22222222')).toMatchObject({ resultado: 'denegado', motivos: { yaDentro: true } });
      expect(de('molinete.abrir')).toHaveLength(0);
    });

    it('rostro sin permiso fijo (23) o no registrado (27): solo se anotan', async () => {
      agregarPersona(base, '11111111');
      await rtlog('23', '11111111');
      await rtlog('27');
      expect(base.eventos).toHaveLength(0);
      expect(de('g4pro.habilitar')).toHaveLength(0);
      expect(await ingreso('11111111')).toMatchObject({ motivos: { sinFacial: true } });
    });

    describe('quién sopló (rastreo del G4 Pro)', () => {
      const hora = new Date('2026-10-05T07:00:00');
      const pase = (pin: string) => ({ hora, pin, nombre: `Persona ${pin} Prueba` });
      /** Deja que se resuelvan las promesas pendientes. */
      const esperar = () => new Promise((r) => setImmediate(r));

      it('sopló el mismo del DNI: se abre y queda confirmado', async () => {
        agregarPersona(base, '11111111');
        quienSoplo = Promise.resolve(pase('11111111'));
        await rtlog('0', '0', hora);
        await esperar();
        expect(de('g4pro.quien-aprobo')).toEqual([{ serialNumber: 'HSR3263100192', horaDispositivo: hora }]);
        // El Panel pasa a mostrar quién aprobó.
        expect(de('ingreso.en-espera').at(-1)).toMatchObject({ esperaDni: true, nombres: 'Aprobó Persona 11111111 Prueba', numeroDocumento: '11111111' });
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado', dniQueSoplo: '11111111' });
        expect(base.eventos[0]).toMatchObject({ resultado: 'autorizado', facialPrimero: true, dniQueSoplo: '11111111' });
        expect(de('molinete.abrir')).toHaveLength(1);
      });

      it('sopló otra persona: denegado "No es quien sopló", no se abre', async () => {
        agregarPersona(base, '11111111');
        agregarPersona(base, '22222222');
        quienSoplo = Promise.resolve(pase('22222222'));
        await rtlog('0', '0', hora);
        await esperar();
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'denegado', motivos: { noEsQuienSoplo: true }, dniQueSoplo: '22222222' });
        expect(base.eventos[0]).toMatchObject({
          numeroDocumento: '11111111',
          denegadoNoEsQuienSoplo: true,
          dniQueSoplo: '22222222',
          facialPrimero: true,
        });
        expect(de('molinete.abrir')).toHaveLength(0);
        // La aprobación es de quien sopló: sigue esperando su DNI.
        expect(await ingreso('22222222')).toMatchObject({ resultado: 'autorizado', dniQueSoplo: '22222222' });
      });

      it('dos personas soplan seguidas: cada una entra con su DNI, en cualquier orden', async () => {
        agregarPersona(base, '11111111');
        agregarPersona(base, '22222222');
        quienSoplo = Promise.resolve(pase('11111111'));
        await rtlog('0', '0', hora);
        await esperar();
        avanzar(3_000);
        quienSoplo = Promise.resolve(pase('22222222'));
        await servicio.correlacionarVerificacionDispositivo({
          verificacionId: 2,
          serialNumber: 'HSR3263100192',
          horaDispositivo: hora,
          eventCode: '0',
          concentracion: '0',
          pin: '0',
        });
        await esperar();
        expect(await servicio.ingresosEnEspera()).toHaveLength(2);
        // Pasa primero el segundo que sopló.
        expect(await ingreso('22222222')).toMatchObject({ resultado: 'autorizado', dniQueSoplo: '22222222' });
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado', dniQueSoplo: '11111111' });
        expect(de('molinete.abrir')).toHaveLength(2);
        expect(await servicio.ingresosEnEspera()).toHaveLength(0);
      });

      it('la misma persona sopla dos veces: vale solo la última', async () => {
        agregarPersona(base, '11111111');
        quienSoplo = Promise.resolve(pase('11111111'));
        await rtlog('0', '0', hora);
        await esperar();
        avanzar(5_000);
        await rtlog('0', '0', hora);
        await esperar();
        expect(await servicio.ingresosEnEspera()).toHaveLength(1);
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado' });
        // No queda una aprobación vieja que venza como "No pasó su DNI a tiempo".
        avanzar(21_000);
        await vencidos();
        expect(base.eventos.filter((e) => e.denegadoSinDni)).toHaveLength(0);
      });

      it('sopló y no pasó su DNI a tiempo: el rechazo queda con su nombre', async () => {
        const id = agregarPersona(base, '11111111');
        quienSoplo = Promise.resolve(pase('11111111'));
        await rtlog('0', '0', hora);
        await esperar();
        avanzar(21_000);
        await vencidos();
        expect(base.eventos[0]).toMatchObject({ denegadoSinDni: true, personaId: id, numeroDocumento: '11111111', dniQueSoplo: '11111111' });
      });

      it('no se pudo saber quién sopló: se abre como antes, sin confirmar', async () => {
        agregarPersona(base, '11111111');
        await rtlog('0', '0', hora);
        await esperar();
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado' });
        expect(base.eventos[0]).toMatchObject({ resultado: 'autorizado', dniQueSoplo: null });
      });

      it('el DNI llega antes de saber quién sopló: espera la respuesta del equipo', async () => {
        agregarPersona(base, '11111111');
        agregarPersona(base, '22222222');
        let responder!: (v: unknown) => void;
        quienSoplo = new Promise((r) => (responder = r));
        await rtlog('0', '0', hora);
        const resultado = ingreso('11111111');
        setTimeout(() => responder(pase('22222222')), 50);
        expect(await resultado).toMatchObject({ resultado: 'denegado', motivos: { noEsQuienSoplo: true } });
      });

      it('el equipo tarda más de 6 s en decirlo: se abre sin confirmar', async () => {
        vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
        vi.setSystemTime(ahora);
        agregarPersona(base, '11111111');
        quienSoplo = new Promise(() => undefined);
        await rtlog('0', '0', hora);
        const resultado = ingreso('11111111');
        await vi.advanceTimersByTimeAsync(6_000);
        expect(await resultado).toMatchObject({ resultado: 'autorizado' });
        expect(base.eventos[0]).toMatchObject({ dniQueSoplo: null });
      });
    });

    it('con la verificación manual activa, vuelve el orden normal (primero el DNI)', async () => {
      manualActiva = true;
      agregarPersona(base, '11111111');
      expect(await ingreso('11111111')).toMatchObject({ estado: 'pendiente_verificacion' });
      expect(base.pendientes[0]).toMatchObject({ manual: true });
    });
  });

  describe('G4 Pro en asistencia: llega el DNI y el grado de cada prueba (ATTLOG)', () => {
    let verificacion = 500;
    /** Prueba del G4 Pro: por defecto, hecha ahora (la hora la pone el equipo). */
    const attlog = (dni: string, alcohol: string | null = '0.00g/L', hora = new Date(ahora)) =>
      servicio.resultadoAsistencia({
        verificacionId: ++verificacion,
        serialNumber: 'HSR3263100192',
        pin: dni,
        horaDispositivo: hora,
        alcohol,
      } satisfies AttlogRecibidoEvent);

    beforeEach(() => {
      base.ajustes.protocolo_g4 = 'asistencia';
    });

    describe('orden normal: vale solo la prueba hecha después del DNI', () => {
      it('primero el DNI y después la prueba: espera, y con 0.00 g/L abre (sin habilitar en el equipo)', async () => {
        agregarPersona(base, '11111111');
        expect(await ingreso('11111111')).toMatchObject({ estado: 'pendiente_verificacion' });
        expect(base.pendientes[0].habilitadoEn).toBeInstanceOf(Date);
        expect(de('ingreso.en-espera')[0].hasta).toBe(new Date(ahora + 60_000).toISOString());
        avanzar(12_000);
        await attlog('11111111');
        expect(base.eventos).toHaveLength(1);
        expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'autorizado' });
        expect(de('molinete.abrir')).toHaveLength(1);
        expect(de('g4pro.habilitar').filter((h) => h.habilitar)).toHaveLength(0);
      });

      it('primero el DNI y la prueba da alcohol alto (0.000951 g/L): denegado por alcohol, con su nombre', async () => {
        agregarPersona(base, '11111111');
        await ingreso('11111111');
        avanzar(10_000);
        await attlog('11111111', '0.000951g/L');
        expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'denegado', denegadoPorAlcohol: true });
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('varias personas a la vez y en cualquier orden de llegada: cada prueba cierra la espera de su DNI', async () => {
        agregarPersona(base, '11111111');
        agregarPersona(base, '22222222');
        await ingreso('11111111');
        await ingreso('22222222');
        expect(de('ingreso.en-espera').map((e) => e.enCola)).toEqual([false, false]);
        avanzar(10_000);
        await attlog('22222222');
        await attlog('11111111', '0.5g/L');
        expect(base.eventos).toEqual([
          expect.objectContaining({ numeroDocumento: '22222222', resultado: 'autorizado' }),
          expect.objectContaining({ numeroDocumento: '11111111', resultado: 'denegado', denegadoPorAlcohol: true }),
        ]);
      });

      it('sopla dos veces después del DNI, bien y después alto: vale la primera, abre y la segunda se ignora', async () => {
        agregarPersona(base, '11111111');
        await ingreso('11111111');
        avanzar(10_000);
        await attlog('11111111');
        avanzar(4_000);
        await attlog('11111111', '0.000595g/L');
        expect(base.eventos).toEqual([expect.objectContaining({ resultado: 'autorizado' })]);
      });

      it('sopla dos veces después del DNI, alto y después bien: vale la primera (alcohol), no abre', async () => {
        agregarPersona(base, '11111111');
        await ingreso('11111111');
        avanzar(10_000);
        await attlog('11111111', '0.000595g/L');
        avanzar(4_000);
        await attlog('11111111');
        expect(base.eventos).toEqual([expect.objectContaining({ resultado: 'denegado', denegadoPorAlcohol: true })]);
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('rostro y alcohol sin pasar antes el DNI: no vale (ni queda "pase su DNI"); con el DNI vuelve a hacer la prueba', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111');
        expect(de('ingreso.en-espera')).toHaveLength(0);
        avanzar(5_000);
        expect(await ingreso('11111111')).toMatchObject({ estado: 'pendiente_verificacion' });
        expect(de('molinete.abrir')).toHaveLength(0);
        avanzar(10_000);
        await attlog('11111111');
        expect(base.eventos[0]).toMatchObject({ resultado: 'autorizado' });
      });

      it('una prueba hecha antes del DNI que llega tarde no cierra la espera', async () => {
        agregarPersona(base, '11111111');
        const antes = new Date(ahora - 10_000);
        await ingreso('11111111');
        avanzar(3_000);
        await attlog('11111111', '0.00g/L', antes);
        expect(base.eventos).toHaveLength(0);
        expect(base.pendientes[0].consumidoEn).toBeNull();
      });

      it('alcohol alto sin DNI: denegado con su nombre igual', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111', '0.000951g/L');
        expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'denegado', denegadoPorAlcohol: true });
      });

      it('pasó su DNI y no llegó su prueba en 1 minuto: "No completó rostro y alcohol"', async () => {
        agregarPersona(base, '11111111');
        await ingreso('11111111');
        avanzar(61_000);
        await vencidos();
        expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'denegado', denegadoSinVerificacion: true });
      });

      it('sin grado de alcohol legible: no abre (ante la duda)', async () => {
        agregarPersona(base, '11111111');
        await ingreso('11111111');
        await attlog('11111111', null);
        expect(base.eventos[0]).toMatchObject({ resultado: 'denegado', denegadoPorAlcohol: true });
      });
    });

    describe('facial primero: vale solo la prueba hecha antes del DNI', () => {
      beforeEach(() => {
        facialPrimero = true;
      });

      it('la prueba llega y después el DNI (en 20 s): abre con quien sopló', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111');
        expect(de('ingreso.en-espera')[0]).toMatchObject({ nombres: 'Aprobó Persona 11111111 Prueba', esperaDni: true, personaId: 100 });
        avanzar(5_000);
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado', dniQueSoplo: '11111111' });
        expect(de('molinete.abrir')).toHaveLength(1);
      });

      it('va primero al DNI sin rostro y alcohol: sin cuenta regresiva; a los 8 s "DNI antes del facial"', async () => {
        agregarPersona(base, '11111111');
        expect(await ingreso('11111111')).toMatchObject({ estado: 'pendiente_verificacion' });
        expect(de('ingreso.en-espera')).toHaveLength(0);
        expect(base.pendientes).toHaveLength(0);
        avanzar(5_000);
        await vencidos();
        expect(base.eventos).toHaveLength(0);
        avanzar(4_000);
        await vencidos();
        expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'denegado', denegadoSinFacial: true });
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('dice "correcto" y pasa el DNI enseguida, antes de que llegue el aviso: espera en silencio y entra', async () => {
        agregarPersona(base, '11111111');
        const correcto = new Date(ahora);
        avanzar(7_000);
        expect(await ingreso('11111111')).toMatchObject({ estado: 'pendiente_verificacion' });
        avanzar(4_000);
        await attlog('11111111', '0.00g/L', correcto);
        expect(base.eventos).toEqual([expect.objectContaining({ numeroDocumento: '11111111', resultado: 'autorizado', dniQueSoplo: '11111111' })]);
        expect(de('molinete.abrir')).toHaveLength(1);
        avanzar(10_000);
        await vencidos();
        expect(base.eventos).toHaveLength(1);
      });

      it('pasa el DNI 18 s después del "correcto" (7 s después de aparecer "pase su DNI"): entra', async () => {
        agregarPersona(base, '11111111');
        const correcto = new Date(ahora);
        avanzar(11_000);
        await attlog('11111111', '0.00g/L', correcto);
        expect(new Date(String(de('ingreso.en-espera')[0].hasta)).getTime() - ahora).toBe(30_000);
        avanzar(7_000);
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado' });
      });

      it('pasa el DNI 31 s después de aparecer "pase su DNI": fuera de plazo, "DNI antes del facial"', async () => {
        agregarPersona(base, '11111111');
        const correcto = new Date(ahora);
        avanzar(11_000);
        await attlog('11111111', '0.00g/L', correcto);
        avanzar(31_000);
        expect(await ingreso('11111111')).toMatchObject({ estado: 'pendiente_verificacion' });
        avanzar(9_000);
        await vencidos();
        expect(base.eventos.find((e) => e.denegadoSinFacial)).toBeDefined();
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('primero el DNI y después da alcohol alto: queda "Alcohol" con su nombre, y no se repite el rechazo', async () => {
        agregarPersona(base, '11111111');
        await ingreso('11111111');
        avanzar(5_000);
        await attlog('11111111', '0.000595g/L');
        avanzar(10_000);
        await vencidos();
        expect(base.eventos).toEqual([expect.objectContaining({ numeroDocumento: '11111111', denegadoPorAlcohol: true })]);
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('la aprobación de otra persona no sirve: el DNI de otro no entra; el dueño entra con el suyo', async () => {
        agregarPersona(base, '11111111');
        agregarPersona(base, '22222222');
        await attlog('22222222');
        expect(await ingreso('11111111')).toMatchObject({ estado: 'pendiente_verificacion' });
        expect(await ingreso('22222222')).toMatchObject({ resultado: 'autorizado' });
        avanzar(9_000);
        await vencidos();
        expect(base.eventos.find((e) => e.numeroDocumento === '11111111')).toMatchObject({ denegadoSinFacial: true });
        expect(de('molinete.abrir')).toHaveLength(1);
      });

      it('sopla dos veces en el mismo pase, bien y después alto: vale la primera y entra', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111');
        avanzar(4_000);
        await attlog('11111111', '0.000595g/L');
        expect(base.eventos).toHaveLength(0);
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado' });
      });

      it('sopla dos veces en el mismo pase, alto y después bien: vale la primera (alcohol)', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111', '0.000595g/L');
        avanzar(4_000);
        await attlog('11111111');
        expect(de('ingreso.en-espera')).toHaveLength(0);
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'denegado', motivos: { alcohol: true } });
        expect(base.eventos).toHaveLength(1);
      });

      it('pasados los 20 s del pase, un soplido nuevo es otro intento (sin bloqueo)', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111', '0.000595g/L');
        avanzar(30_000);
        await attlog('11111111');
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'autorizado' });
      });

      it('con alcohol alto en un intento nuevo, se anula lo que aprobó antes', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111');
        avanzar(5_000);
        // Marcación con hora del equipo 21 s después de la primera: otro intento.
        await attlog('11111111', '0.000595g/L', new Date(ahora + 16_000));
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'denegado', motivos: { alcohol: true } });
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('alcohol alto sin DNI: denegado con su nombre; si pasa el DNI enseguida, se le responde ese rechazo', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111', '0.000951g/L');
        expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'denegado', denegadoPorAlcohol: true });
        avanzar(3_000);
        expect(await ingreso('11111111')).toMatchObject({ resultado: 'denegado', motivos: { alcohol: true }, eventoId: base.eventos[0].id });
        expect(base.eventos).toHaveLength(1);
        expect(base.pendientes).toHaveLength(0);
      });

      it('aprobó pero no pasó su DNI en 30 s: denegado "sin DNI" con su nombre', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111');
        avanzar(36_000);
        await vencidos();
        expect(base.eventos[0]).toMatchObject({ numeroDocumento: '11111111', resultado: 'denegado', denegadoSinDni: true });
      });

      it('documentos vencidos: se deniega con el DNI aunque haya aprobado', async () => {
        agregarPersona(base, '55555555', { vencido: true });
        await attlog('55555555');
        expect(await ingreso('55555555')).toMatchObject({ resultado: 'denegado', motivos: { documentos: true } });
        expect(de('molinete.abrir')).toHaveLength(0);
      });
    });

    describe('tarjeta de contingencia (sin DNI): el vigilante la pasa en lugar del DNI', () => {
      const tarjeta = (tipoMovimiento: 'ingreso' | 'salida' = 'ingreso', codigo = TARJETA) =>
        servicio.registrarTarjeta({ codigo, tipoMovimiento, torniqueteId: tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Salida' });
      const vigilante = { id: 7, empresaId: 1, rol: 'vigilancia' as const, correo: 'vigilante@tmam.pe' };

      beforeEach(() => {
        facialPrimero = true;
      });

      it('aprobó rostro y alcohol y el vigilante pasa la tarjeta: entra a su nombre, con la tarjeta', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111');
        avanzar(8_000);
        expect(await tarjeta()).toMatchObject({ resultado: 'autorizado', numeroDocumento: '11111111', dniQueSoplo: '11111111' });
        expect(base.eventos[0]).toMatchObject({ personaId: 100, resultado: 'autorizado', tarjetaContingenciaId: 1 });
        expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'ingreso' })]);
        expect(usosTarjeta).toEqual([expect.objectContaining({ tarjetaId: 1, aceptada: true, eventoAccesoId: base.eventos[0].id })]);
        expect(de('ingreso.espera-terminada')).toHaveLength(1);
      });

      it('la pasa antes de que llegue el aviso de la prueba (hecha antes): espera en silencio y entra', async () => {
        agregarPersona(base, '11111111');
        const correcto = new Date(ahora);
        avanzar(5_000);
        expect(await tarjeta()).toMatchObject({ estado: 'pendiente_verificacion' });
        avanzar(5_000);
        await attlog('11111111', '0.00g/L', correcto);
        expect(base.eventos).toEqual([expect.objectContaining({ numeroDocumento: '11111111', resultado: 'autorizado', tarjetaContingenciaId: 1 })]);
        expect(de('molinete.abrir')).toHaveLength(1);
      });

      it('sin nadie que aprobó rostro y alcohol: a los 8 s queda rechazada, suena el aviso y no abre', async () => {
        expect(await tarjeta()).toMatchObject({ estado: 'pendiente_verificacion' });
        avanzar(9_000);
        await vencidos();
        expect(usosTarjeta).toEqual([expect.objectContaining({ aceptada: false, detalle: 'Nadie aprobó rostro y alcohol antes de pasar la tarjeta' })]);
        expect(de('aviso.denegado')).toEqual([{ tipoMovimiento: 'ingreso' }]);
        expect(base.eventos).toHaveLength(0);
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('esperaba la prueba y dio alcohol alto: queda "Alcohol" con su nombre y la tarjeta no se usa', async () => {
        agregarPersona(base, '11111111');
        const prueba = new Date(ahora);
        avanzar(2_000);
        await tarjeta();
        await attlog('11111111', '0.000595g/L', prueba);
        expect(base.eventos).toEqual([expect.objectContaining({ numeroDocumento: '11111111', denegadoPorAlcohol: true })]);
        expect(usosTarjeta).toEqual([expect.objectContaining({ aceptada: false })]);
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('dos personas aprobaron a la vez: no se sabe a quién dejar pasar; no abre y nadie pierde su aprobación', async () => {
        agregarPersona(base, '11111111');
        agregarPersona(base, '22222222');
        await attlog('11111111');
        await attlog('22222222');
        expect(await tarjeta()).toMatchObject({ resultado: 'denegado' });
        expect(de('molinete.abrir')).toHaveLength(0);
        expect(await ingreso('22222222')).toMatchObject({ resultado: 'autorizado' });
      });

      it('documentos vencidos: se deniega igual que con el DNI (queda con la tarjeta)', async () => {
        agregarPersona(base, '55555555', { vencido: true });
        await attlog('55555555');
        expect(await tarjeta()).toMatchObject({ resultado: 'denegado', motivos: { documentos: true } });
        expect(base.eventos[0]).toMatchObject({ tarjetaContingenciaId: 1, denegadoPorDocumentos: true });
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('tarjeta desactivada o vencida, orden normal o verificación manual: rechazada al momento', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111');
        expect(await tarjeta('ingreso', TARJETA_DESACTIVADA)).toMatchObject({ resultado: 'denegado', mensaje: 'Tarjeta desactivada' });
        facialPrimero = false;
        expect(await tarjeta()).toMatchObject({ resultado: 'denegado' });
        facialPrimero = true;
        manualActiva = true;
        expect(await tarjeta()).toMatchObject({ resultado: 'denegado' });
        expect(usosTarjeta.map((u) => u.aceptada)).toEqual([false, false, false]);
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('salida: sin elegir al trabajador en el Panel no abre; elegido, sale a su nombre', async () => {
        agregarPersona(base, '11111111');
        yaIngreso('11111111');
        expect(await tarjeta('salida')).toMatchObject({ resultado: 'denegado' });
        expect(de('aviso.denegado')).toEqual([{ tipoMovimiento: 'salida' }]);
        expect(await servicio.prepararSalidaSinDni(100, vigilante)).toMatchObject({ numeroDocumento: '11111111', preparadaPor: 'vigilante@tmam.pe' });
        expect(await tarjeta('salida')).toMatchObject({ resultado: 'autorizado', numeroDocumento: '11111111' });
        expect(base.eventos.at(-1)).toMatchObject({ tipoMovimiento: 'salida', tarjetaContingenciaId: 1, verificadoPorId: 7 });
        expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'salida' })]);
        expect(servicio.salidaSinDniPreparada()).toBeNull();
        // Se usa una vez: otra pasada ya no abre.
        expect(await tarjeta('salida')).toMatchObject({ resultado: 'denegado' });
      });

      it('salida: no se puede elegir a quien figura fuera, y la elegida vence a los 2 minutos', async () => {
        agregarPersona(base, '11111111');
        await expect(servicio.prepararSalidaSinDni(100, vigilante)).rejects.toThrow('figura fuera');
        yaIngreso('11111111');
        await servicio.prepararSalidaSinDni(100, vigilante);
        avanzar(121_000);
        await vencidos();
        expect(servicio.salidaSinDniPreparada()).toBeNull();
        expect(de('salida-sin-dni.cambio').at(-1)).toBeNull();
        expect(await tarjeta('salida')).toMatchObject({ resultado: 'denegado' });
      });
    });

    describe('sin lector de DNI (desconectado): ingreso por rostro y salida desde "Presentes ahora"', () => {
      const vigilante = { id: 7, empresaId: 1, rol: 'vigilancia' as const, correo: 'vigilante@tmam.pe' };

      beforeEach(() => {
        facialPrimero = true;
      });

      it('lector de ingreso desconectado: quien aprueba rostro y alcohol entra sin pasar el DNI', async () => {
        sinLector.ingreso = true;
        agregarPersona(base, '11111111');
        await attlog('11111111');
        expect(base.eventos).toEqual([
          expect.objectContaining({ personaId: 100, tipoMovimiento: 'ingreso', resultado: 'autorizado', sinLector: true, dniQueSoplo: '11111111' }),
        ]);
        expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'ingreso' })]);
        expect(de('ingreso.en-espera')).toHaveLength(0);
      });

      it('sin lector de ingreso se revisan igual los documentos: vencidos, denegado', async () => {
        sinLector.ingreso = true;
        agregarPersona(base, '11111111', { vencido: true });
        await attlog('11111111');
        expect(base.eventos).toEqual([expect.objectContaining({ resultado: 'denegado', denegadoPorDocumentos: true, sinLector: true })]);
        expect(de('molinete.abrir')).toHaveLength(0);
      });

      it('con el lector conectado no cambia nada: espera el DNI', async () => {
        agregarPersona(base, '11111111');
        await attlog('11111111');
        expect(base.eventos).toHaveLength(0);
        expect(de('ingreso.en-espera')).toHaveLength(1);
      });

      it('salida sin lector: abre la salida de quien figura dentro, con el vigilante que la abrió', async () => {
        agregarPersona(base, '11111111');
        yaIngreso('11111111');
        await expect(servicio.salidaSinLector(100, vigilante)).rejects.toThrow('ya está conectado');
        sinLector.salida = true;
        expect(await servicio.salidaSinLector(100, vigilante)).toMatchObject({ resultado: 'autorizado', numeroDocumento: '11111111' });
        expect(base.eventos.at(-1)).toMatchObject({ tipoMovimiento: 'salida', sinLector: true, verificadoPorId: 7 });
        expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'salida' })]);
        // Ya salió: no se puede abrir otra vez.
        await expect(servicio.salidaSinLector(100, vigilante)).rejects.toThrow('figura fuera');
      });
    });

    it('prueba de alguien que no está en el sistema, o durante la verificación manual: no se usa', async () => {
      facialPrimero = true;
      await attlog('99999999');
      manualActiva = true;
      agregarPersona(base, '11111111');
      await attlog('11111111');
      expect(base.eventos).toHaveLength(0);
      expect(de('ingreso.en-espera')).toHaveLength(0);
    });
  });
});

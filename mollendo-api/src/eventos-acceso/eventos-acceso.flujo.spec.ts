/**
 * Flujo del ingreso con el G4 Pro (diagrama de ingreso): habilitación de una
 * persona a la vez, cola, resultado del equipo (rtlog), vencimiento y relé.
 * Usa una base de datos falsa en memoria con solo las consultas que necesita
 * EventosAccesoService, y un reloj controlado.
 */
import { EventosAccesoService } from './eventos-acceso.service.js';
import type { RtlogRecibidoEvent } from '../push-sdk/push-sdk.service.js';

type Fila = Record<string, unknown> & { id: number };

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
      findUnique: async ({ where }: { where: { tipoDocumentoIdentidad_numeroDocumento: { numeroDocumento: string } } }) =>
        personas.find((p) => p.numeroDocumento === where.tipoDocumentoIdentidad_numeroDocumento.numeroDocumento) ?? null,
    },
    documentoPersona: {
      findMany: async ({ where }: { where: { personaId: number } }) => documentos.filter((d) => d.personaId === where.personaId),
    },
    ingresoPendiente: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const fila: Fila = { id: siguienteId++, creadoEn: new Date(), consumidoEn: null, habilitadoEn: null, torniqueteId: null, ...data };
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
    },
    verificacionDispositivo: { update: async () => ({}) },
    $transaction: async (operaciones: Promise<unknown>[]) => Promise.all(operaciones),
  };

  return { prisma, personas, documentos, pendientes, eventos };
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

  const ingreso = (dni: string) => servicio.registrarIngreso({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: dni, torniqueteId: 'Ingreso' });
  const salida = (dni: string) => servicio.registrarSalida({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: dni, torniqueteId: 'Salida' });
  const rtlog = (eventCode: string, pin = '0') =>
    servicio.correlacionarVerificacionDispositivo({
      verificacionId: 1,
      serialNumber: 'HSR3263100192',
      horaDispositivo: null,
      eventCode,
      concentracion: '0',
      pin,
    } satisfies RtlogRecibidoEvent);
  const avanzar = (ms: number) => {
    ahora += ms;
    vi.setSystemTime(ahora);
  };
  const vencidos = () => (servicio as unknown as { cerrarVencidos: () => Promise<void> }).cerrarVencidos();
  const de = (evento: string) => emitidos.filter((e) => e.evento === evento).map((e) => e.datos);

  beforeEach(() => {
    ahora = new Date('2026-10-05T12:00:00Z').getTime();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(ahora);
    base = crearBaseFalsa();
    emitidos = [];
    const eventEmitter = { emit: (evento: string, datos: Record<string, unknown>) => emitidos.push({ evento, datos }) };
    servicio = new EventosAccesoService(base.prisma as never, eventEmitter as never);
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
    it('persona registrada: salida autorizada y relé de salida, sin pasar por el G4 Pro', async () => {
      agregarPersona(base, '11111111');
      const r = await salida('11111111');
      expect(r).toMatchObject({ tipoMovimiento: 'salida', resultado: 'autorizado', numeroDocumento: '11111111' });
      expect(base.eventos).toEqual([expect.objectContaining({ tipoMovimiento: 'salida', resultado: 'autorizado', torniqueteId: 'Salida' })]);
      expect(de('molinete.abrir')).toEqual([expect.objectContaining({ tipoMovimiento: 'salida', torniqueteId: 'Salida' })]);
      expect(de('evento-acceso.registrado')).toHaveLength(1);
      expect(de('g4pro.habilitar')).toHaveLength(0);
      expect(base.pendientes).toHaveLength(0);
    });

    it('dado de baja o con documentos vencidos: igual sale (no se retiene a nadie adentro)', async () => {
      agregarPersona(base, '44444444', { baja: true });
      agregarPersona(base, '55555555', { vencido: true });
      await salida('44444444');
      await salida('55555555');
      expect(base.eventos.map((e) => e.resultado)).toEqual(['autorizado', 'autorizado']);
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
      await ingreso('11111111');
      await salida('22222222');
      expect(base.pendientes[0].consumidoEn).toBeNull();
      await rtlog('0');
      expect(base.eventos.map((e) => [e.numeroDocumento, e.tipoMovimiento, e.resultado])).toEqual([
        ['22222222', 'salida', 'autorizado'],
        ['11111111', 'ingreso', 'autorizado'],
      ]);
      expect(de('molinete.abrir').map((e) => e.tipoMovimiento)).toEqual(['salida', 'ingreso']);
    });
  });
});

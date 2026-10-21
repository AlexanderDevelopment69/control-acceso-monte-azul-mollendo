import { duracionTexto, fallasEquipos, textoVuelta } from './bitacora-equipos.js';
import { BitacoraEquiposService } from './bitacora-equipos.service.js';

const lector = (conectado: boolean) => ({ configurado: true, conectado, ultimaLectura: null });
const estado = (cambios: { controlador?: boolean; lectorSalida?: boolean; g4?: boolean; base?: boolean } = {}) => ({
  fecha: '2026-10-21T10:00:00.000Z',
  baseDeDatos: { estado: cambios.base === false ? ('down' as const) : ('up' as const) },
  claveEquiposConfigurada: true,
  respaldos: { disponible: true, ultimoAutomatico: { fecha: '2026-10-21T04:00:00.000Z' } },
  dispositivos: [{ serialNumber: 'HSR1', enLinea: cambios.g4 ?? true, ultimaActividad: null }],
  lectoresDni: { ingreso: lector(true), salida: lector(cambios.lectorSalida ?? true) },
  releMolinetes: { ingreso: { conectado: true }, salida: { conectado: true } },
  controlador: { remoto: true, conectado: cambios.controlador ?? true, ultimoReporte: null },
});

describe('registro de desconexiones de equipos', () => {
  it('una falla por equipo; sin el controlador no se cuentan sus lectores ni relés', () => {
    expect(fallasEquipos(estado())).toEqual([]);
    expect(fallasEquipos(estado({ lectorSalida: false, g4: false }))).toEqual([
      { etiqueta: 'Equipo facial (G4 Pro)', caida: 'desconectado' },
      { etiqueta: 'Lector de DNI de salida', caida: 'desconectado. Contingencia "sin lector" activada' },
    ]);
    expect(fallasEquipos(estado({ controlador: false, lectorSalida: false }))).toEqual([
      { etiqueta: 'Controlador (PC)', caida: 'desconectado (sin internet o apagado)' },
    ]);
  });

  it('textos de la vuelta, con cuánto duró', () => {
    expect(duracionTexto(4_000)).toBe('4 s');
    expect(duracionTexto(125_000)).toBe('2 min 5 s');
    expect(duracionTexto(35 * 60_000)).toBe('35 min');
    expect(duracionTexto(26 * 3_600_000)).toBe('1 día 2 h');
    expect(textoVuelta('Lector de DNI de salida', 35 * 60_000, true)).toBe(
      'Lector de DNI de salida: conectado de nuevo (estuvo 35 min sin conexión). Contingencia "sin lector" terminada',
    );
    expect(textoVuelta('Controlador (PC)', 90_000, true)).toBe('Controlador (PC): conectado de nuevo (estuvo 1 min 30 s sin conexión)');
  });

  const crear = (previos: { accion: string; detalle: string; fechaHora: Date }[] = []) => {
    const guardados: { accion: string; detalle: string; fechaHora: Date }[] = [];
    let actual = estado();
    let baseCaida = false;
    const prisma = {
      auditoria: {
        findMany: async () => previos,
        createMany: async ({ data }: { data: typeof guardados }) => {
          if (baseCaida) throw new Error('sin base');
          guardados.push(...data);
        },
      },
    };
    const avisos: unknown[] = [];
    const servicio = new BitacoraEquiposService(prisma as never, {
      calcular: async () => {
        if (baseCaida) throw new Error('sin base');
        const e = actual;
        return { api: { fecha: e.fecha }, baseDeDatos: e.baseDeDatos, integraciones: { claveEquiposConfigurada: true }, respaldos: e.respaldos, equipos: { dispositivos: e.dispositivos }, lectoresDni: e.lectoresDni, releMolinetes: e.releMolinetes, controladorGarita: e.controlador };
      },
    } as never, { emit: (_e: string, d: unknown) => avisos.push(d) } as never);
    return {
      avisos,
      servicio,
      guardados,
      poner: (cambios: Parameters<typeof estado>[0]) => (actual = estado(cambios)),
      caerBase: (v: boolean) => (baseCaida = v),
    };
  };
  const t = (seg: number) => new Date(Date.UTC(2026, 9, 21, 13, 0, seg));

  it('registra cada desconexión y cada vuelta, también las cortas', async () => {
    const b = crear();
    await b.servicio.revisar(t(0));
    b.poner({ lectorSalida: false });
    await b.servicio.revisar(t(10));
    await b.servicio.revisar(t(20));
    b.poner({});
    await b.servicio.revisar(t(30));
    expect(b.guardados.map((g) => [g.accion, g.detalle])).toEqual([
      ['desconexion', 'Lector de DNI de salida: desconectado. Contingencia "sin lector" activada'],
      ['reconexion', 'Lector de DNI de salida: conectado de nuevo (estuvo 20 s sin conexión). Contingencia "sin lector" terminada'],
    ]);
    // Un aviso en vivo por cambio (la caída y la vuelta), no por cada revisión.
    expect(b.avisos).toHaveLength(2);
  });

  it('sin el Controlador (PC), el lector que ya estaba caído sigue abierto hasta que se lo pueda ver', async () => {
    const b = crear();
    b.poner({ lectorSalida: false });
    await b.servicio.revisar(t(0));
    b.poner({ controlador: false, lectorSalida: false });
    await b.servicio.revisar(t(10));
    b.poner({});
    await b.servicio.revisar(t(40));
    expect(b.guardados.map((g) => g.detalle)).toEqual([
      'Lector de DNI de salida: desconectado. Contingencia "sin lector" activada',
      'Controlador (PC): desconectado (sin internet o apagado)',
      'Lector de DNI de salida: conectado de nuevo (estuvo 40 s sin conexión). Contingencia "sin lector" terminada',
      'Controlador (PC): conectado de nuevo (estuvo 30 s sin conexión)',
    ]);
  });

  it('una falla abierta antes de reiniciar el servidor se cierra con su hora real', async () => {
    const b = crear([{ accion: 'desconexion', detalle: 'Equipo facial (G4 Pro): desconectado', fechaHora: t(0) }]);
    await b.servicio.revisar(t(50));
    expect(b.guardados.map((g) => g.detalle)).toEqual(['Equipo facial (G4 Pro): conectado de nuevo (estuvo 50 s sin conexión)']);
  });

  it('sin base de datos, los registros esperan y se guardan al volver, con su hora', async () => {
    const b = crear();
    await b.servicio.revisar(t(0));
    b.caerBase(true);
    await b.servicio.revisar(t(10));
    expect(b.guardados).toEqual([]);
    b.caerBase(false);
    await b.servicio.revisar(t(30));
    expect(b.guardados.map((g) => [g.detalle, g.fechaHora])).toEqual([
      ['Base de datos: sin conexión', t(10)],
      ['Base de datos: conectada de nuevo (estuvo 20 s sin conexión)', t(30)],
    ]);
  });
});

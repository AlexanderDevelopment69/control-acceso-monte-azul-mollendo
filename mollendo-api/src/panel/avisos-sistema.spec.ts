import { avisosDelSistema, type EstadoParaAvisos } from './avisos-sistema.js';

const base = (): EstadoParaAvisos => ({
  fecha: '2026-10-10T05:00:00Z',
  baseDeDatos: { estado: 'up' },
  claveEquiposConfigurada: true,
  respaldos: { disponible: true, ultimoAutomatico: { fecha: '2026-10-10T00:00:00Z' } },
  dispositivos: [{ serialNumber: 'HSR1', enLinea: true, ultimaActividad: null }],
  lectoresDni: {
    ingreso: { configurado: true, conectado: true, ultimaLectura: null },
    salida: { configurado: true, conectado: true, ultimaLectura: null },
  },
  releMolinetes: { ingreso: { conectado: true }, salida: { conectado: true }, avisoIngreso: { conectado: true } },
  controlador: { remoto: true, conectado: true, ultimoReporte: null },
});

describe('avisosDelSistema', () => {
  it('todo en línea: sin avisos', () => {
    expect(avisosDelSistema(base())).toEqual([]);
  });

  it('controlador caído: un aviso por tarjeta de equipos, como en Sistema y APIs', () => {
    const e = base();
    e.controlador = { remoto: true, conectado: false, ultimoReporte: '2026-10-08T19:39:00Z' };
    e.dispositivos[0] = { serialNumber: 'HSR1', enLinea: false, ultimaActividad: '2026-10-08T19:39:00Z' };
    const avisos = avisosDelSistema(e);
    expect(avisos.map((a) => [a.equipo, a.estado])).toEqual([
      ['Controlador', 'Desconectado'],
      ['Terminal facial HSR1', 'Desconectado'],
      ['Lectores de DNI', 'Desconectados'],
      ['Relés de molinetes', 'Desconectados'],
      ['Relés de aviso', 'Desconectados'],
    ]);
    expect(avisos[0].desde).toBe('2026-10-08T19:39:00Z');
  });

  it('terminal facial desconectado, con la última vez que se lo vio', () => {
    const e = base();
    e.dispositivos[0] = { serialNumber: 'HSR1', enLinea: false, ultimaActividad: '2026-10-08T19:39:00Z' };
    expect(avisosDelSistema(e)).toEqual([expect.objectContaining({ tipo: 'terminal', equipo: 'Terminal facial HSR1', desde: '2026-10-08T19:39:00Z' })]);
  });

  it('alcoholímetro desconectado (con el equipo facial en línea), con la última vez que se lo vio', () => {
    const e = base();
    e.dispositivos[0] = { serialNumber: 'HSR1', enLinea: true, ultimaActividad: null, alcoholimetro: { conectado: false, conectadoVisto: '2026-10-21T13:00:00Z' } };
    expect(avisosDelSistema(e)).toEqual([
      expect.objectContaining({ tipo: 'alcoholimetro', equipo: 'Alcoholímetro (DT1700)', estado: 'Desconectado', desde: '2026-10-21T13:00:00Z' }),
    ]);
    // Sin datos todavía, o con el equipo facial caído (ya avisado), no se avisa del alcoholímetro.
    e.dispositivos[0].alcoholimetro = { conectado: null, conectadoVisto: null };
    expect(avisosDelSistema(e)).toEqual([]);
  });

  it('lector sin configurar no es una falla; lector desconectado sí', () => {
    const e = base();
    e.lectoresDni.ingreso = { configurado: false, conectado: false, ultimaLectura: null };
    e.lectoresDni.salida.conectado = false;
    expect(avisosDelSistema(e).map((a) => [a.equipo, a.estado, a.impacto])).toEqual([
      ['Lectores de DNI', 'Desconectado: salida', 'No se leen DNI en la salida. Contingencia “sin lector” activa'],
    ]);
  });

  it('relé de aviso y respaldos atrasados también avisan', () => {
    const e = base();
    e.releMolinetes.avisoIngreso = { conectado: false };
    e.respaldos.ultimoAutomatico = { fecha: '2026-10-08T00:00:00Z' };
    expect(avisosDelSistema(e).map((a) => [a.tipo, a.estado])).toEqual([
      ['respaldos', 'Atrasados'],
      ['aviso', 'Desconectado: ingreso'],
    ]);
  });

  it('sin respaldos en este servidor (desarrollo) no avisa', () => {
    const e = base();
    e.respaldos = { disponible: false, ultimoAutomatico: null };
    expect(avisosDelSistema(e)).toEqual([]);
  });

  it('los dos relés de molinetes caídos van en un solo aviso', () => {
    const e = base();
    e.releMolinetes.ingreso = { conectado: false };
    e.releMolinetes.salida = { conectado: false };
    expect(avisosDelSistema(e)).toEqual([
      expect.objectContaining({ equipo: 'Relés de molinetes', estado: 'Desconectado: ingreso y salida', impacto: 'No se abre el molinete de ingreso ni el de salida' }),
    ]);
  });
});

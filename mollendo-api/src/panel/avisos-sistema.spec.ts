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

  it('controlador caído: un solo aviso, no uno por lector y relé', () => {
    const e = base();
    e.controlador = { remoto: true, conectado: false, ultimoReporte: '2026-10-08T19:39:00Z' };
    e.lectoresDni.ingreso.conectado = false;
    e.releMolinetes.ingreso = { conectado: false };
    const avisos = avisosDelSistema(e);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toMatchObject({ tipo: 'controlador', gravedad: 'critico', desde: '2026-10-08T19:39:00Z' });
  });

  it('terminal facial desconectado, con la última vez que se lo vio', () => {
    const e = base();
    e.dispositivos[0] = { serialNumber: 'HSR1', enLinea: false, ultimaActividad: '2026-10-08T19:39:00Z' };
    expect(avisosDelSistema(e)).toEqual([expect.objectContaining({ tipo: 'terminal', equipo: 'Terminal facial HSR1', desde: '2026-10-08T19:39:00Z' })]);
  });

  it('lector sin configurar no es una falla; lector desconectado sí', () => {
    const e = base();
    e.lectoresDni.ingreso = { configurado: false, conectado: false, ultimaLectura: null };
    e.lectoresDni.salida.conectado = false;
    expect(avisosDelSistema(e).map((a) => a.equipo)).toEqual(['Lector de DNI de salida']);
  });

  it('relé de aviso y respaldos atrasados son advertencias', () => {
    const e = base();
    e.releMolinetes.avisoIngreso = { conectado: false };
    e.respaldos.ultimoAutomatico = { fecha: '2026-10-08T00:00:00Z' };
    expect(avisosDelSistema(e).map((a) => [a.tipo, a.gravedad])).toEqual([
      ['aviso', 'advertencia'],
      ['respaldos', 'advertencia'],
    ]);
  });

  it('sin respaldos en este servidor (desarrollo) no avisa', () => {
    const e = base();
    e.respaldos = { disponible: false, ultimoAutomatico: null };
    expect(avisosDelSistema(e)).toEqual([]);
  });
});

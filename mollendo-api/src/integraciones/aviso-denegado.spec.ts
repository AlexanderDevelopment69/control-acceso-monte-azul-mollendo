import { IntegracionesService } from './integraciones.service.js';
import { ControladorGateway } from '../controlador-remoto/controlador.gateway.js';

/** Relés de aviso: contacto seco en cada ingreso o salida denegados, en el relé de esa puerta. */
describe('Aviso de ingreso y salida denegados', () => {
  const casos = [
    { evento: { tipoMovimiento: 'ingreso', resultado: 'denegado' }, avisa: ['avisoIngreso'] },
    { evento: { tipoMovimiento: 'ingreso', resultado: 'autorizado' }, avisa: [] },
    { evento: { tipoMovimiento: 'salida', resultado: 'denegado' }, avisa: ['avisoSalida'] },
    { evento: { tipoMovimiento: 'salida', resultado: 'autorizado' }, avisa: [] },
  ];
  const remotoAntes = process.env.MOLINETES_REMOTOS;
  afterEach(() => {
    process.env.MOLINETES_REMOTOS = remotoAntes;
  });

  it.each(casos)('servidor con relés propios: $evento.tipoMovimiento $evento.resultado → $avisa', async ({ evento, avisa }) => {
    process.env.MOLINETES_REMOTOS = 'false';
    const pulsos: string[] = [];
    const releUsb = { pulso: async (r: string) => (pulsos.push(r), true) };
    const servicio = new IntegracionesService({} as never, releUsb as never, {} as never);
    await servicio.avisarDenegado(evento);
    expect(pulsos).toEqual(avisa);
  });

  it('con controlador, el servidor no usa relés propios: le manda el aviso al controlador', async () => {
    process.env.MOLINETES_REMOTOS = 'true';
    const pulsos: string[] = [];
    const servicio = new IntegracionesService({} as never, { pulso: async (r: string) => (pulsos.push(r), true) } as never, {} as never);
    await servicio.avisarDenegado({ tipoMovimiento: 'ingreso', resultado: 'denegado' });
    expect(pulsos).toEqual([]);

    const enviados: { evento: string; datos: unknown }[] = [];
    const gateway = new ControladorGateway();
    gateway.server = { emit: (evento: string, datos: unknown) => enviados.push({ evento, datos }) } as never;
    (gateway as unknown as { conexiones: Map<string, unknown> }).conexiones.set('c1', {});
    gateway.avisarDenegado({ tipoMovimiento: 'ingreso', resultado: 'denegado', numeroDocumento: '48058719' });
    gateway.avisarDenegado({ tipoMovimiento: 'ingreso', resultado: 'autorizado', numeroDocumento: '48058719' });
    gateway.avisarDenegado({ tipoMovimiento: 'salida', resultado: 'denegado', numeroDocumento: '10000001' });
    expect(enviados).toEqual([
      { evento: 'aviso-denegado', datos: { tipoMovimiento: 'ingreso', numeroDocumento: '48058719' } },
      { evento: 'aviso-denegado', datos: { tipoMovimiento: 'salida', numeroDocumento: '10000001' } },
    ]);
  });
});

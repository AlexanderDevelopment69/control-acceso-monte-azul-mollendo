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
    const gateway = new ControladorGateway({ emit: () => true } as never);
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

  it('controlador desconectado: se siguen mostrando sus lectores y relés (como no conectados)', () => {
    process.env.MOLINETES_REMOTOS = 'true';
    const gateway = new ControladorGateway({ emit: () => true } as never);
    gateway.handleConnection({ id: 'c1', handshake: { auth: { clave: (process.env.DEVICE_API_KEY = 'k') }, address: 'x' }, disconnect: () => undefined } as never);
    const rele = { conectado: true, serie: 'DEN01', canal: 1, ultimoPulso: null, error: null };
    const lector = { configurado: true, conectado: true, ultimaLectura: null, error: null };
    gateway.recibirEstado({ id: 'c1' } as never, {
      lectoresDni: { ingreso: lector, salida: lector },
      releMolinetes: { ingreso: { ...rele, serie: 'ING01' }, salida: { ...rele, serie: 'SAL01' }, avisoIngreso: rele },
      listaPersonal: { personas: 10, actualizado: null },
      salidasPendientes: 0,
    });
    gateway.handleDisconnect({ id: 'c1' } as never);
    const estado = gateway.estado();
    expect(estado.conectado).toBe(false);
    expect(estado.estado?.releMolinetes.avisoIngreso).toMatchObject({ serie: 'DEN01', conectado: false, error: 'Controlador desconectado' });
    expect(estado.estado?.lectoresDni.ingreso).toMatchObject({ configurado: true, conectado: false });
  });

  it('sin lector: solo con el controlador en línea y el lector desconectado; avisa al activarse y al terminar', () => {
    process.env.MOLINETES_REMOTOS = 'true';
    const avisos: unknown[] = [];
    const gateway = new ControladorGateway({ emit: (_evento: string, datos: unknown) => avisos.push(datos) } as never);
    gateway.handleConnection({ id: 'c1', handshake: { auth: { clave: (process.env.DEVICE_API_KEY = 'k') }, address: 'x' }, disconnect: () => undefined } as never);
    const rele = { conectado: true, serie: 'R1', canal: 1, ultimoPulso: null, error: null };
    const lector = (conectado: boolean) => ({ configurado: true, conectado, ultimaLectura: null, error: null });
    const informar = (ingreso: boolean, salida: boolean) =>
      gateway.recibirEstado({ id: 'c1' } as never, {
        lectoresDni: { ingreso: lector(ingreso), salida: lector(salida) },
        releMolinetes: { ingreso: rele, salida: rele },
        listaPersonal: { personas: 0, actualizado: null },
        salidasPendientes: 0,
      });
    informar(true, true);
    expect(gateway.sinLector()).toEqual({ ingreso: false, salida: false });
    informar(true, false);
    informar(true, false);
    expect(gateway.sinLector()).toEqual({ ingreso: false, salida: true });
    // Sin el controlador no se abre ningún molinete: no hay contingencia.
    gateway.handleDisconnect({ id: 'c1' } as never);
    expect(gateway.sinLector()).toEqual({ ingreso: false, salida: false });
    expect(avisos).toEqual([{ ingreso: false, salida: true }, { ingreso: false, salida: false }]);
  });
});

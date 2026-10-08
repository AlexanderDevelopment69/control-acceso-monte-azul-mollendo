import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ControladorService } from './controlador.service.js';
import { fechaSinConexion } from '../eventos-acceso/eventos-acceso.service.js';

/**
 * Controlador sin conexión (opción B): nadie entra, sale quien está
 * en la lista del personal, y esas salidas se envían después con su hora.
 */
describe('Controlador', () => {
  let carpeta: string;
  let pulsos: string[];
  let servicio: ControladorService;
  let fetchOriginal: typeof fetch;
  let enviados: { url: string; cuerpo: unknown }[];
  let hayInternet: boolean;

  const dni = (numeroDocumento: string) => ({ tipoDocumentoIdentidad: 'DNI' as const, numeroDocumento, torniqueteId: 'Salida' });

  beforeEach(() => {
    carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'controlador-'));
    fs.writeFileSync(path.join(carpeta, 'lista-personal.json'), JSON.stringify({ generado: '2026-10-07T10:00:00Z', documentos: ['11111111'] }));
    process.env.SERVIDOR_URL = 'http://servidor.prueba';
    process.env.DEVICE_API_KEY = 'clave';
    process.env.CONTROLADOR_DATOS = carpeta;
    pulsos = [];
    enviados = [];
    hayInternet = false;
    fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async (url: string, opciones?: RequestInit) => {
      if (!hayInternet) throw new TypeError('fetch failed');
      enviados.push({ url, cuerpo: opciones?.body ? JSON.parse(String(opciones.body)) : null });
      return new Response(JSON.stringify({ resultado: 'autorizado' }), { status: 201 });
    }) as typeof fetch;
    const releUsb = { pulso: async (m: string) => (pulsos.push(m), true), estado: async () => ({}) };
    servicio = new ControladorService(releUsb as never, {} as never);
    // Sin abrir el canal real: solo se carga lo guardado en disco.
    (servicio as unknown as { cargarDeDisco: () => void }).cargarDeDisco();
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
    fs.rmSync(carpeta, { recursive: true, force: true });
  });

  it('sin conexión no deja entrar (y da el aviso de ingreso denegado)', async () => {
    const r = await servicio.registrarIngreso(dni('11111111'));
    expect(r.estado).toContain('sin conexión');
    expect(pulsos).toEqual(['avisoIngreso']);
  });

  it('sin conexión deja salir a quien está en la lista del personal y guarda la salida', async () => {
    const r = await servicio.registrarSalida(dni('11111111'));
    expect(r.resultado).toBe('autorizado (sin conexión)');
    expect(pulsos).toEqual(['salida']);
    const guardadas = JSON.parse(fs.readFileSync(path.join(carpeta, 'salidas-pendientes.json'), 'utf8'));
    expect(guardadas).toHaveLength(1);
    expect(guardadas[0].dto.numeroDocumento).toBe('11111111');
  });

  it('sin conexión no deja salir a quien no está en la lista del personal (y da el aviso de salida denegada)', async () => {
    const r = await servicio.registrarSalida(dni('99999999'));
    expect(r.resultado).toContain('denegado');
    expect(pulsos).toEqual(['avisoSalida']);
  });

  it('al volver la conexión envía las salidas pendientes con su hora y sin volver a abrir', async () => {
    await servicio.registrarSalida(dni('11111111'));
    hayInternet = true;
    await (servicio as unknown as { enviarPendientes: () => Promise<void> }).enviarPendientes();
    expect(enviados).toHaveLength(1);
    expect(enviados[0].url).toBe('http://servidor.prueba/api/v1/eventos-acceso/salida');
    expect(enviados[0].cuerpo).toMatchObject({ numeroDocumento: '11111111', sinConexion: true, fechaHora: expect.any(String) });
    expect(JSON.parse(fs.readFileSync(path.join(carpeta, 'salidas-pendientes.json'), 'utf8'))).toEqual([]);
    expect(pulsos).toEqual(['salida']); // solo la apertura de cuando no había conexión
  });

  it('con conexión, la salida la decide el servidor', async () => {
    hayInternet = true;
    const r = await servicio.registrarSalida(dni('99999999'));
    expect(r.resultado).toBe('autorizado');
    expect(enviados[0].cuerpo).toMatchObject({ numeroDocumento: '99999999' });
  });
});

describe('Hora de una salida registrada sin conexión', () => {
  const ahora = new Date('2026-10-07T12:00:00Z');
  it('acepta una hora pasada de esta semana', () => {
    expect(fechaSinConexion('2026-10-07T09:30:00Z', ahora).toISOString()).toBe('2026-10-07T09:30:00.000Z');
  });
  it('rechaza horas futuras, de hace más de una semana o sin hora', () => {
    expect(() => fechaSinConexion('2026-10-07T13:00:00Z', ahora)).toThrow('futura');
    expect(() => fechaSinConexion('2026-09-25T12:00:00Z', ahora)).toThrow('más de 7 días');
    expect(() => fechaSinConexion(undefined, ahora)).toThrow('fecha y hora');
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { Socket } from 'socket.io';
import { ControladorGateway } from './controlador.gateway.js';

vi.mock('../common/seguridad/equipos.util.js', () => ({ claveEquiposValida: () => true }));

/** Gateway con un controlador conectado (o no) y la respuesta que daría a la orden de reinicio. */
function crear({ conectado = true, respuesta }: { conectado?: boolean; respuesta?: () => Promise<unknown> } = {}) {
  const gateway = new ControladorGateway({ emit: vi.fn() } as unknown as EventEmitter2);
  const emitWithAck = vi.fn(respuesta ?? (() => Promise.resolve([{ ok: true }])));
  gateway.server = { timeout: () => ({ emitWithAck }) } as unknown as ControladorGateway['server'];
  if (conectado) {
    gateway.handleConnection({ id: 'c1', handshake: { auth: { clave: 'x' }, address: '10.0.0.5' } } as unknown as Socket);
    informar(gateway, 'c1');
  }
  return { gateway, emitWithAck };
}

/** El controlador envió su estado (sin escribirlo en disco, como haría recibirEstado). */
function informar(gateway: ControladorGateway, id: string) {
  const conexiones = (gateway as unknown as { conexiones: Map<string, { ultimoReporte: string | null; estado: unknown }> }).conexiones;
  const conexion = conexiones.get(id)!;
  conexion.ultimoReporte = new Date().toISOString();
  conexion.estado = { lectoresDni: {}, releMolinetes: {}, listaPersonal: { personas: 0, actualizado: null }, salidasPendientes: 0 };
}

describe('ControladorGateway: reiniciar el Controlador (PC)', () => {
  beforeEach(() => vi.stubEnv('MOLINETES_REMOTOS', 'true'));
  afterEach(() => vi.unstubAllEnvs());

  it('recién conectado y sin su primer informe cuenta como desconectado (no se inventan caídas de lectores y relés)', () => {
    const { gateway } = crear({ conectado: false });
    gateway.handleConnection({ id: 'c9', handshake: { auth: { clave: 'x' }, address: '10.0.0.5' } } as unknown as Socket);
    // Desconectado: la bitácora de equipos no revisa sus lectores y relés (dependen del controlador).
    expect(gateway.estado().conectado).toBe(false);

    informar(gateway, 'c9');
    expect(gateway.estado().conectado).toBe(true);
  });

  it('sin controlador conectado no envía la orden', async () => {
    const { gateway, emitWithAck } = crear({ conectado: false });
    expect(await gateway.reiniciar()).toEqual({ enviado: false, error: 'El controlador no está conectado: no se le puede enviar la orden.' });
    expect(emitWithAck).not.toHaveBeenCalled();
  });

  it('si el controlador confirma, queda "reiniciando" hasta que vuelve a conectarse', async () => {
    const { gateway, emitWithAck } = crear();
    expect(await gateway.reiniciar()).toEqual({ enviado: true });
    expect(emitWithAck).toHaveBeenCalledWith('reiniciar');
    expect(gateway.estado().reiniciandoDesde).not.toBeNull();

    gateway.handleConnection({ id: 'c2', handshake: { auth: { clave: 'x' }, address: '10.0.0.5' } } as unknown as Socket);
    expect(gateway.estado().reiniciandoDesde).toBeNull();
  });

  it('si el controlador no puede, devuelve su motivo', async () => {
    const { gateway } = crear({ respuesta: () => Promise.resolve([{ ok: false, error: 'el sistema no lo permite' }]) });
    expect(await gateway.reiniciar()).toEqual({ enviado: false, error: 'El Controlador (PC) no pudo reiniciarse: el sistema no lo permite.' });
    expect(gateway.estado().reiniciandoDesde).toBeNull();
  });

  it('un controlador que no responde (versión anterior) no queda como "reiniciando"', async () => {
    const { gateway } = crear({ respuesta: () => Promise.reject(new Error('operation has timed out')) });
    expect(await gateway.reiniciar()).toEqual({ enviado: false, error: 'El Controlador (PC) no respondió a la orden; no se reinició.' });
    expect(gateway.estado().reiniciandoDesde).toBeNull();
  });
});

import { ReleUsbService, type Rele } from './rele-usb.service.js';

/**
 * Aviso "alterno" (el pitido de los torniquetes): un contacto lo prende y el
 * siguiente lo apaga. Se simula el relé (cada pulso queda anotado) y el reloj.
 */
class ReleSimulado extends ReleUsbService {
  pulsos: Rele[] = [];
  falla: ((intento: number) => boolean) | null = null;
  protected override async pulsoSimple(rele: Rele): Promise<boolean> {
    const intento = this.pulsos.length + 1;
    if (this.falla?.(intento)) return false;
    this.pulsos.push(rele);
    return true;
  }
}

const ENV = ['RELE_AVISO_SALIDA_SERIE', 'RELE_AVISO_SALIDA_MODO', 'RELE_AVISO_INGRESO_SERIE', 'RELE_AVISO_INGRESO_MODO', 'RELE_AVISO_ALTERNO_MS'];

describe('Aviso alterno (prende y apaga)', () => {
  const antes = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
  let rele: ReleSimulado;

  beforeEach(() => {
    vi.useFakeTimers();
    process.env.RELE_AVISO_SALIDA_SERIE = 'DSA01';
    process.env.RELE_AVISO_SALIDA_MODO = 'alterno';
    process.env.RELE_AVISO_INGRESO_SERIE = 'DEN01';
    delete process.env.RELE_AVISO_INGRESO_MODO;
    delete process.env.RELE_AVISO_ALTERNO_MS;
    rele = new ReleSimulado();
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const k of ENV) {
      if (antes[k] === undefined) delete process.env[k];
      else process.env[k] = antes[k];
    }
  });

  it('un denegado: prende, y a los 3 segundos lo apaga con un segundo pulso', async () => {
    expect(await rele.pulso('avisoSalida')).toBe(true);
    expect(rele.pulsos).toEqual(['avisoSalida']);
    await vi.advanceTimersByTimeAsync(2999);
    expect(rele.pulsos).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(rele.pulsos).toEqual(['avisoSalida', 'avisoSalida']);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(rele.pulsos).toHaveLength(2); // nunca un pulso de más
  });

  it('otro denegado mientras suena: no da pulsos de más, solo alarga los 3 segundos', async () => {
    await rele.pulso('avisoSalida');
    await vi.advanceTimersByTimeAsync(2000);
    await rele.pulso('avisoSalida');
    expect(rele.pulsos).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(2999);
    expect(rele.pulsos).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(rele.pulsos).toHaveLength(2);
  });

  it('dos denegados al mismo tiempo: un solo pulso para prender', async () => {
    await Promise.all([rele.pulso('avisoSalida'), rele.pulso('avisoSalida')]);
    expect(rele.pulsos).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(3000);
    expect(rele.pulsos).toHaveLength(2);
  });

  it('si no se pudo prender (relé desconectado), no programa el apagado', async () => {
    rele.falla = () => true;
    expect(await rele.pulso('avisoSalida')).toBe(false);
    rele.falla = null;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(rele.pulsos).toEqual([]);
  });

  it('si el apagado falla, lo reintenta y deja el error a la vista', async () => {
    await rele.pulso('avisoSalida');
    rele.falla = () => true;
    await vi.advanceTimersByTimeAsync(3000);
    expect(rele.pulsos).toHaveLength(1);
    expect((await rele.estado()).avisoSalida?.error).toMatch(/No se pudo apagar el aviso \(intento 1 de 3\)/);
    rele.falla = null;
    await vi.advanceTimersByTimeAsync(3000);
    expect(rele.pulsos).toHaveLength(2); // segundo intento: apagado
  });

  it('un nuevo denegado después de apagado vuelve a prender', async () => {
    await rele.pulso('avisoSalida');
    await vi.advanceTimersByTimeAsync(3000);
    await rele.pulso('avisoSalida');
    expect(rele.pulsos).toHaveLength(3);
    await vi.advanceTimersByTimeAsync(3000);
    expect(rele.pulsos).toHaveLength(4);
  });

  it('el aviso de ingreso sin modo sigue con un solo pulso, como antes', async () => {
    await rele.pulso('avisoIngreso');
    await vi.advanceTimersByTimeAsync(10_000);
    expect(rele.pulsos).toEqual(['avisoIngreso']);
  });

  it('los molinetes no cambian: un pulso por apertura', async () => {
    await rele.pulso('salida');
    await vi.advanceTimersByTimeAsync(10_000);
    expect(rele.pulsos).toEqual(['salida']);
  });

  it('el tiempo entre los dos pulsos se configura', async () => {
    process.env.RELE_AVISO_ALTERNO_MS = '5000';
    rele = new ReleSimulado();
    await rele.pulso('avisoSalida');
    await vi.advanceTimersByTimeAsync(4999);
    expect(rele.pulsos).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(rele.pulsos).toHaveLength(2);
  });
});

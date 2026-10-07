import { DIAS_CONSERVACION, LimpiezaRegistrosService } from './limpieza-registros.service.js';

describe('Limpieza de registros técnicos', () => {
  it(`borra solo lo procesado de más de ${DIAS_CONSERVACION} días`, async () => {
    const borrados: Record<string, unknown> = {};
    const tabla = (nombre: string, count: number) => ({
      deleteMany: (args: unknown) => {
        borrados[nombre] = args;
        return Promise.resolve({ count });
      },
    });
    const prisma = {
      comandoDispositivo: tabla('comandos', 3),
      verificacionDispositivo: tabla('verificaciones', 2),
      ingresoPendiente: tabla('esperas', 1),
      $transaction: (operaciones: Promise<unknown>[]) => Promise.all(operaciones),
    };
    const servicio = new LimpiezaRegistrosService(prisma as never);

    const resultado = await servicio.limpiar(new Date('2026-10-07T12:00:00Z'));

    const limite = new Date('2026-07-09T12:00:00Z'); // 90 días antes
    expect(resultado).toEqual({ comandos: 3, verificaciones: 2, esperas: 1 });
    // Los comandos que el equipo todavía no recogió no se borran.
    expect(borrados.comandos).toEqual({ where: { estado: { not: 'pendiente' }, creadoEn: { lt: limite } } });
    expect(borrados.verificaciones).toEqual({ where: { creadoEn: { lt: limite } } });
    // Las esperas abiertas (persona esperando su turno) no se borran.
    expect(borrados.esperas).toEqual({ where: { consumidoEn: { not: null }, creadoEn: { lt: limite } } });
  });

  it('si falla, lo anota y no rompe la API', async () => {
    const prisma = {
      comandoDispositivo: { deleteMany: () => Promise.resolve({ count: 0 }) },
      verificacionDispositivo: { deleteMany: () => Promise.resolve({ count: 0 }) },
      ingresoPendiente: { deleteMany: () => Promise.resolve({ count: 0 }) },
      $transaction: () => Promise.reject(new Error('sin conexión')),
    };
    const servicio = new LimpiezaRegistrosService(prisma as never);
    await expect(servicio.limpiar()).resolves.toBeNull();
  });
});

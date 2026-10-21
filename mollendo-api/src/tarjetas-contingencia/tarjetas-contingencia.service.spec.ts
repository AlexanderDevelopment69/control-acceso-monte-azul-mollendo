import { TarjetasContingenciaService } from './tarjetas-contingencia.service.js';

describe('eliminar una tarjeta de contingencia', () => {
  const crear = (usos: number, eventos: number) => {
    const borradas: number[] = [];
    const auditoria: unknown[] = [];
    const prisma = {
      tarjetaContingencia: {
        findUnique: async ({ where }: { where: { id: number } }) => (where.id === 1 ? { id: 1, numero: 1 } : null),
        delete: async ({ where }: { where: { id: number } }) => void borradas.push(where.id),
      },
      usoTarjetaContingencia: { count: async () => usos },
      eventoAcceso: { count: async () => eventos },
    };
    const servicio = new TarjetasContingenciaService(prisma as never, { registrar: async (a: unknown) => void auditoria.push(a) } as never);
    return { servicio, borradas, auditoria };
  };

  it('nunca se usó: se borra y queda en la auditoría', async () => {
    const { servicio, borradas, auditoria } = crear(0, 0);
    await expect(servicio.eliminar(1, 5)).resolves.toEqual({ ok: true });
    expect(borradas).toEqual([1]);
    expect(auditoria).toEqual([expect.objectContaining({ usuarioId: 5, tablaAfectada: 'tarjeta_contingencia', accion: 'eliminar' })]);
  });

  it('ya se pasó por un lector: no se borra (se desactiva, para conservar su historial)', async () => {
    const { servicio, borradas } = crear(2, 1);
    await expect(servicio.eliminar(1, 5)).rejects.toThrow('ya se usó');
    expect(borradas).toEqual([]);
  });

  it('no existe: "Tarjeta no encontrada"', async () => {
    const { servicio } = crear(0, 0);
    await expect(servicio.eliminar(9, 5)).rejects.toThrow('Tarjeta no encontrada');
  });
});

import { PersonasService } from './personas.service.js';

// Período de autorización en el alta y la edición del personal (22/10/2026).
describe('Período de autorización al registrar y editar', () => {
  const base = { id: 7, nombres: 'Juan', apellidos: 'Pérez', numeroDocumento: '45678912', tipoDocumentoIdentidad: 'DNI', empresaId: 1, estado: 'activo' };
  function armar(persona: Record<string, unknown> = { ...base, autorizadoDesde: null, autorizadoHasta: null, motivoAutorizacion: null }) {
    const datos: Record<string, unknown>[] = [];
    const auditados: Record<string, unknown>[] = [];
    const prisma = {
      empresa: { findUnique: async () => ({ id: 1 }) },
      persona: {
        findUnique: async ({ where }: { where: { id?: number } }) => (where.id ? persona : null),
        create: async ({ data }: { data: Record<string, unknown> }) => (datos.push(data), { ...base, ...data }),
        update: async ({ data }: { data: Record<string, unknown> }) => (datos.push(data), { ...persona, ...data }),
      },
    };
    const auditoria = { registrar: async (p: Record<string, unknown>) => void auditados.push(p) };
    const servicio = new PersonasService(prisma as never, auditoria as never, { emit: () => true } as never);
    return { servicio, datos, auditados };
  }
  const admin = { id: 1 } as never;
  const alta = { empresaId: 1, perfil: 'visita', tipoDocumentoIdentidad: 'DNI', numeroDocumento: '45678912', nombres: 'Juan', apellidos: 'Pérez' } as const;

  it('alta sin período: los tres campos vacíos', async () => {
    const { servicio, datos, auditados } = armar();
    await servicio.create({ ...alta }, admin);
    expect(datos[0]).toMatchObject({ autorizadoDesde: null, autorizadoHasta: null, motivoAutorizacion: null });
    expect(auditados[0]).toMatchObject({ accion: 'crear', detalle: null });
  });

  it('alta con período: fechas y motivo, y queda en la Auditoría', async () => {
    const { servicio, datos, auditados } = armar();
    await servicio.create({ ...alta, autorizadoDesde: '2026-10-22', autorizadoHasta: '2026-10-31', motivoAutorizacion: 'Visita técnica' }, admin);
    expect(datos[0]).toMatchObject({ autorizadoDesde: new Date('2026-10-22T00:00:00.000Z'), motivoAutorizacion: 'Visita técnica' });
    expect(auditados[0]).toMatchObject({ detalle: 'Período autorizado de Juan Pérez (DNI 45678912): del 22/10/2026 al 31/10/2026. Motivo: Visita técnica' });
  });

  it('período incompleto o al revés: no se guarda', async () => {
    const { servicio, datos } = armar();
    await expect(servicio.create({ ...alta, autorizadoDesde: '2026-10-22', autorizadoHasta: '2026-10-31' }, admin)).rejects.toThrow(
      'Complete el período de autorización',
    );
    await expect(
      servicio.create({ ...alta, autorizadoDesde: '2026-10-31', autorizadoHasta: '2026-10-22', motivoAutorizacion: 'Obra' }, admin),
    ).rejects.toThrow('La fecha de finalización no puede ser anterior');
    expect(datos).toHaveLength(0);
  });

  it('editar: cambiar solo el motivo conserva las fechas; sin tocar el período, no se cambia', async () => {
    const conPeriodo = {
      ...base,
      autorizadoDesde: new Date('2026-10-22T00:00:00.000Z'),
      autorizadoHasta: new Date('2026-10-31T00:00:00.000Z'),
      motivoAutorizacion: 'Visita técnica',
    };
    const { servicio, datos, auditados } = armar(conPeriodo);
    await servicio.update(7, { motivoAutorizacion: 'Obra en el muelle' }, admin);
    expect(datos[0]).toMatchObject({ autorizadoDesde: conPeriodo.autorizadoDesde, motivoAutorizacion: 'Obra en el muelle' });
    expect(auditados[0]).toMatchObject({ detalle: expect.stringContaining('Motivo: Obra en el muelle') });

    await servicio.update(7, { nombres: 'Juan Carlos' }, admin);
    expect(datos[1]).not.toHaveProperty('autorizadoDesde');
    expect(auditados[1]).toMatchObject({ detalle: null });
  });

  it('editar: quitar el período (los tres vacíos)', async () => {
    const { servicio, datos, auditados } = armar({ ...base, autorizadoDesde: new Date('2026-10-22T00:00:00.000Z'), autorizadoHasta: new Date('2026-10-31T00:00:00.000Z'), motivoAutorizacion: 'Obra' });
    await servicio.update(7, { autorizadoDesde: null, autorizadoHasta: null, motivoAutorizacion: null }, admin);
    expect(datos[0]).toMatchObject({ autorizadoDesde: null, autorizadoHasta: null, motivoAutorizacion: null });
    expect(auditados[0]).toMatchObject({ detalle: 'Quitó el período autorizado de Juan Pérez (DNI 45678912)' });
  });
});

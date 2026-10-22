import { PersonasService } from './personas.service.js';

// Dar de baja y reactivar: el motivo es obligatorio en los dos casos (22/10/2026) y queda en la Auditoría.
describe('Dar de baja y reactivar al personal', () => {
  const persona = { id: 7, nombres: 'Juan', apellidos: 'Pérez Quispe', numeroDocumento: '45678912', estado: 'activo' };
  function armar() {
    const actualizaciones: Record<string, unknown>[] = [];
    const auditados: Record<string, unknown>[] = [];
    const prisma = {
      persona: {
        findUnique: async () => persona,
        update: async ({ data }: { data: Record<string, unknown> }) => (actualizaciones.push(data), { ...persona, ...data }),
      },
    };
    const auditoria = { registrar: async (p: Record<string, unknown>) => void auditados.push(p) };
    const servicio = new PersonasService(prisma as never, auditoria as never, { emit: () => true } as never);
    return { servicio, actualizaciones, auditados };
  }
  const admin = { id: 1 } as never;

  it('sin motivo (o con espacios) no se da de baja ni se reactiva', async () => {
    const { servicio, actualizaciones } = armar();
    await expect(servicio.updateEstado(7, { estado: 'inactivo' }, admin)).rejects.toThrow('Escriba el motivo de la baja');
    await expect(servicio.updateEstado(7, { estado: 'activo', motivo: '   ' }, admin)).rejects.toThrow('Escriba el motivo de la reactivación');
    expect(actualizaciones).toHaveLength(0);
  });

  it('dar de baja: guarda motivo y fecha, borra los de la reactivación y lo deja en la Auditoría', async () => {
    const { servicio, actualizaciones, auditados } = armar();
    await servicio.updateEstado(7, { estado: 'inactivo', motivo: '  Terminó   su contrato ' }, admin);
    expect(actualizaciones[0]).toMatchObject({ estado: 'inactivo', motivoBaja: 'Terminó su contrato', motivoReactivacion: null, fechaReactivacion: null });
    expect(auditados[0]).toMatchObject({
      tablaAfectada: 'persona',
      accion: 'modificar',
      detalle: 'Dio de baja a Juan Pérez Quispe (DNI 45678912). Motivo: Terminó su contrato',
    });
  });

  it('reactivar: guarda motivo y fecha de la reactivación y borra los de la baja', async () => {
    const { servicio, actualizaciones, auditados } = armar();
    await servicio.updateEstado(7, { estado: 'activo', motivo: 'Volvió a trabajar en el Terminal' }, admin);
    expect(actualizaciones[0]).toMatchObject({
      estado: 'activo',
      motivoBaja: null,
      fechaBaja: null,
      motivoReactivacion: 'Volvió a trabajar en el Terminal',
      fechaReactivacion: expect.any(Date),
    });
    expect(auditados[0]).toMatchObject({ detalle: 'Reactivó a Juan Pérez Quispe (DNI 45678912). Motivo: Volvió a trabajar en el Terminal' });
  });
});

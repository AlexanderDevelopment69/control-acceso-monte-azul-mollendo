import { ConflictException, NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import { EmpresasService } from './empresas.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditoriaService } from '../auditoria/auditoria.service.js';

function crear(conteo: { personas: number; usuarios: number } | null) {
  const prisma = {
    empresa: {
      findUnique: vi.fn().mockResolvedValue(conteo && { id: 7, razonSocial: 'Dewdwe', _count: conteo }),
      delete: vi.fn().mockResolvedValue({}),
    },
  };
  const auditoria = { registrar: vi.fn().mockResolvedValue(undefined) };
  const service = new EmpresasService(prisma as unknown as PrismaService, auditoria as unknown as AuditoriaService);
  return { service, prisma, auditoria };
}

describe('eliminar una empresa', () => {
  it('sin personal ni usuarios: se elimina y queda en la auditoría', async () => {
    const { service, prisma, auditoria } = crear({ personas: 0, usuarios: 0 });
    await expect(service.remove(7, 1)).resolves.toEqual({ id: 7, razonSocial: 'Dewdwe' });
    expect(prisma.empresa.delete).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(auditoria.registrar).toHaveBeenCalledWith({ usuarioId: 1, tablaAfectada: 'empresa', registroId: 7, accion: 'eliminar' });
  });

  it('con personal (aunque esté dado de baja) o usuarios: no se elimina', async () => {
    for (const conteo of [
      { personas: 1, usuarios: 0 },
      { personas: 0, usuarios: 2 },
    ]) {
      const { service, prisma, auditoria } = crear(conteo);
      await expect(service.remove(7, 1)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.empresa.delete).not.toHaveBeenCalled();
      expect(auditoria.registrar).not.toHaveBeenCalled();
    }
  });

  it('si no existe, avisa', async () => {
    await expect(crear(null).service.remove(7, 1)).rejects.toBeInstanceOf(NotFoundException);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

const admin: AuthenticatedUser = { id: 1, empresaId: 1, rol: 'administrador', correo: 'admin@monteazulsur.com.pe' };

function servicio(cuenta: { id: number; correo: string; rol: 'administrador' | 'vigilancia' | 'soporte' }) {
  const prisma = {
    usuario: {
      findUnique: vi.fn(async ({ where }: { where: { id?: number; correo?: string } }) =>
        where.id === cuenta.id ? { ...cuenta, estadoCuenta: 'activo' } : null,
      ),
      update: vi.fn(async ({ data }: { data: { correo?: string } }) => ({ ...cuenta, ...data })),
    },
  };
  const auditoria = { registrar: vi.fn() };
  const eventos = { emit: vi.fn() };
  return { prisma, servicio: new UsuariosService(prisma as never, auditoria as never, eventos as never) };
}

describe('UsuariosService.update', () => {
  it('no deja cambiar el correo de la cuenta de soporte', async () => {
    const { prisma, servicio: s } = servicio({ id: 3, correo: 'soporte@monteazulsur.com.pe', rol: 'soporte' });
    await expect(s.update(3, { correo: 'otro@monteazulsur.com.pe' }, admin)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('sí deja cambiar el correo de una cuenta de vigilancia', async () => {
    const { prisma, servicio: s } = servicio({ id: 2, correo: 'vigilancia@monteazulsur.com.pe', rol: 'vigilancia' });
    await s.update(2, { correo: 'garita@monteazulsur.com.pe' }, admin);
    expect(prisma.usuario.update).toHaveBeenCalled();
  });
});

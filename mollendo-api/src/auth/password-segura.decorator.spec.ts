import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CambiarPasswordDto } from './dto/cambiar-password.dto.js';

const errores = async (passwordNueva: string) =>
  (await validate(plainToInstance(CambiarPasswordDto, { passwordActual: 'actual', passwordNueva }))).flatMap((e) =>
    Object.values(e.constraints ?? {}),
  );

describe('PasswordSegura (contraseñas nuevas)', () => {
  it('acepta 10 o más caracteres con letras y números', async () => {
    expect(await errores('Mollendo2026')).toEqual([]);
    expect(await errores('garita 1234')).toEqual([]);
  });

  it('rechaza menos de 10 caracteres', async () => {
    expect(await errores('Molle2026')).toContain('La contraseña nueva debe tener al menos 10 caracteres');
  });

  it('pide al menos una letra y un número', async () => {
    expect(await errores('1234567890')).toContain('La contraseña nueva debe tener al menos una letra');
    expect(await errores('solamenteletras')).toContain('La contraseña nueva debe tener al menos un número');
  });
});

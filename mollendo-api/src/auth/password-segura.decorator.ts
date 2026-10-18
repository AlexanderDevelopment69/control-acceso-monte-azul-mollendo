import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Largo mínimo de una contraseña nueva (antes 8; las ya creadas siguen valiendo). */
export const LARGO_MINIMO_PASSWORD = 10;

/**
 * Regla para las contraseñas nuevas (al crear un usuario, restablecerla o
 * cambiarla): al menos 10 caracteres, con letras y números. Las contraseñas
 * de 8 caracteres ya guardadas siguen sirviendo para entrar.
 */
export function PasswordSegura(campo = 'La contraseña') {
  return applyDecorators(
    IsString({ message: `${campo} debe ser texto` }),
    MinLength(LARGO_MINIMO_PASSWORD, { message: `${campo} debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres` }),
    MaxLength(72, { message: `${campo} no puede tener más de 72 caracteres` }),
    Matches(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/, { message: `${campo} debe tener al menos una letra` }),
    Matches(/\d/, { message: `${campo} debe tener al menos un número` }),
  );
}

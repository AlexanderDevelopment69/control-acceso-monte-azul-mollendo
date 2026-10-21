import { ValidationPipe } from '@nestjs/common';
import { IngresoDto } from './ingreso.dto.js';
import { SalidaDto } from './salida.dto.js';
import { ActivarVerificacionManualDto, DecisionManualDto } from './verificacion-manual.dto.js';

// La API valida con whitelist y forbidNonWhitelisted (main.ts). Los campos que
// solo usa el servidor (tarjeta, sin lector, quién eligió) no deben hacer
// rechazar un DNI normal del lector, ni poder mandarse desde afuera.
describe('DNI del lector: campos internos', () => {
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
  const validar = (metatype: typeof IngresoDto | typeof SalidaDto, body: object) => pipe.transform(body, { type: 'body', metatype });

  it('un DNI normal pasa, en el ingreso y en la salida', async () => {
    await expect(validar(IngresoDto, { tipoDocumentoIdentidad: 'DNI', numeroDocumento: '12345678', torniqueteId: 'Ingreso' })).resolves.toBeDefined();
    await expect(validar(SalidaDto, { tipoDocumentoIdentidad: 'DNI', numeroDocumento: '12345678' })).resolves.toBeDefined();
  });

  it('desde afuera no se pueden mandar los campos internos', async () => {
    await expect(validar(IngresoDto, { tipoDocumentoIdentidad: 'DNI', numeroDocumento: '12345678', sinLector: true })).rejects.toBeDefined();
    await expect(validar(SalidaDto, { tipoDocumentoIdentidad: 'DNI', numeroDocumento: '12345678', verificadoPorId: 1 })).rejects.toBeDefined();
  });
});

// Verificación manual (21/10/2026): el grado es obligatorio solo al registrar la prueba con número.
describe('Verificación manual: decisión y activación', () => {
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
  const decision = (body: object) => pipe.transform(body, { type: 'body', metatype: DecisionManualDto });
  const activar = (body: object) => pipe.transform(body, { type: 'body', metatype: ActivarVerificacionManualDto });

  it('con número, el grado es un número de 0 en adelante', async () => {
    await expect(decision({ decision: 'grado', grado: 0 })).resolves.toMatchObject({ grado: 0 });
    await expect(decision({ decision: 'grado', grado: 0.125 })).resolves.toBeDefined();
    await expect(decision({ decision: 'grado' })).rejects.toBeDefined();
    await expect(decision({ decision: 'grado', grado: 'abc' })).rejects.toBeDefined();
  });

  it('sin número y "no es la persona" no piden el grado; una decisión desconocida no pasa', async () => {
    await expect(decision({ decision: 'marco-apto' })).resolves.toBeDefined();
    await expect(decision({ decision: 'marco-alcohol' })).resolves.toBeDefined();
    await expect(decision({ decision: 'no-es-la-persona' })).resolves.toBeDefined();
    await expect(decision({ decision: 'abrir' })).rejects.toBeDefined();
  });

  it('la causa de la activación es opcional y solo de las tres conocidas', async () => {
    await expect(activar({ motivo: 'Equipo facial desconectado' })).resolves.toBeDefined();
    await expect(activar({ motivo: 'Alcoholímetro desconectado', causa: 'alcoholimetro' })).resolves.toBeDefined();
    await expect(activar({ motivo: 'El equipo facial no toma la prueba', causa: 'ambar' })).resolves.toBeDefined();
    await expect(activar({ motivo: 'Otro', causa: 'otra' })).rejects.toBeDefined();
  });
});

import { ValidationPipe } from '@nestjs/common';
import { IngresoDto } from './ingreso.dto.js';
import { SalidaDto } from './salida.dto.js';

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

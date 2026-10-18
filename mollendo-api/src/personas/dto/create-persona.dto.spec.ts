import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePersonaDto } from './create-persona.dto.js';
import { UpdatePersonaDto } from './update-persona.dto.js';

const datos = { empresaId: 1, tipoDocumentoIdentidad: 'DNI', numeroDocumento: '45678912', nombres: 'Rosa', apellidos: 'Díaz' };
const errores = async (clase: typeof CreatePersonaDto | typeof UpdatePersonaDto, valor: object) =>
  (await validate(plainToInstance(clase, valor))).flatMap((e) => Object.values(e.constraints ?? {}));

describe('perfil de la persona', () => {
  it('es obligatorio al registrarla', async () => {
    expect(await errores(CreatePersonaDto, datos)).toEqual(['Elija el perfil de la persona']);
    expect(await errores(CreatePersonaDto, { ...datos, perfil: 'conductor' })).toEqual([]);
  });

  it('solo acepta los perfiles definidos', async () => {
    expect(await errores(CreatePersonaDto, { ...datos, perfil: 'gerente' })).toEqual(['Elija el perfil de la persona']);
  });

  it('se puede cambiar solo el perfil', async () => {
    expect(await errores(UpdatePersonaDto, { perfil: 'visita' })).toEqual([]);
    expect(await errores(UpdatePersonaDto, { perfil: 'otro' })).toEqual(['Elija el perfil de la persona']);
  });
});

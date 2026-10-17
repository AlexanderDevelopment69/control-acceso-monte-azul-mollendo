import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEmpresaDto } from './create-empresa.dto.js';
import { UpdateEmpresaDto } from './update-empresa.dto.js';

const errores = async (clase: new () => object, valor: object) =>
  (await validate(plainToInstance(clase, valor))).flatMap((e) => Object.values(e.constraints ?? {}));

const datos = { ruc: '20123456789', razonSocial: 'Estibajes del Sur E.I.R.L.', correoContacto: 'contacto@estibajes.pe' };

describe('datos de la empresa', () => {
  it('RUC de 11 dígitos, sin letras; razón social y correo obligatorios', async () => {
    expect(await errores(CreateEmpresaDto, { ...datos, ruc: ' 20123456789 ' })).toEqual([]);
    expect(await errores(CreateEmpresaDto, { ...datos, ruc: '2012345678A' })).toEqual(['El RUC debe tener 11 dígitos']);
    expect(await errores(CreateEmpresaDto, { ...datos, ruc: '2012345678' })).toEqual(['El RUC debe tener 11 dígitos']);
    expect(await errores(CreateEmpresaDto, { ...datos, razonSocial: '   ' })).toEqual(['La razón social es obligatoria']);
    expect(await errores(CreateEmpresaDto, { ...datos, correoContacto: 'sin-arroba' })).toEqual(['Ingrese un correo válido']);
  });

  it('al editar, cada dato es opcional pero se valida igual; el estado es activa o inactiva', async () => {
    expect(await errores(UpdateEmpresaDto, { estado: 'inactiva' })).toEqual([]);
    expect(await errores(UpdateEmpresaDto, { ruc: '123' })).toEqual(['El RUC debe tener 11 dígitos']);
    expect(await errores(UpdateEmpresaDto, { estado: 'cerrada' })).toEqual(['El estado debe ser "activa" o "inactiva"']);
  });
});

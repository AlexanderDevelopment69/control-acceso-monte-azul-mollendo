import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreateEmpresaDto } from './dto/create-empresa.dto.js';
import type { UpdateEmpresaDto } from './dto/update-empresa.dto.js';
import type { QueryEmpresasDto } from './dto/query-empresas.dto.js';

@Injectable()
export class EmpresasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(dto: CreateEmpresaDto, usuarioId: number) {
    const existente = await this.prisma.empresa.findUnique({ where: { ruc: dto.ruc } });
    if (existente) {
      throw new ConflictException('Ya existe una empresa registrada con ese RUC');
    }

    const empresa = await this.prisma.empresa.create({ data: dto });
    await this.auditoriaService.registrar({
      usuarioId,
      tablaAfectada: 'empresa',
      registroId: empresa.id,
      accion: 'crear',
    });
    return empresa;
  }

  async findAll(query: QueryEmpresasDto) {
    return this.prisma.empresa.findMany({
      where: {
        estado: query.estado,
        ...(query.busqueda && {
          OR: [
            { razonSocial: { contains: query.busqueda, mode: 'insensitive' } },
            { ruc: { contains: query.busqueda } },
          ],
        }),
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return empresa;
  }

  async update(id: number, dto: UpdateEmpresaDto, usuarioId: number) {
    await this.findOne(id);
    const empresa = await this.prisma.empresa.update({ where: { id }, data: dto });
    await this.auditoriaService.registrar({
      usuarioId,
      tablaAfectada: 'empresa',
      registroId: empresa.id,
      accion: 'modificar',
    });
    return empresa;
  }
}

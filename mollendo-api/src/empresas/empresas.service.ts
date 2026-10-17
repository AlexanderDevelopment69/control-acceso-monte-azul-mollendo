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

  /** Con cuántas personas activas tiene cada una (vista Empresas y aviso al desactivar). */
  async findAll(query: QueryEmpresasDto) {
    const empresas = await this.prisma.empresa.findMany({
      where: {
        estado: query.estado,
        ...(query.busqueda && {
          OR: [
            { razonSocial: { contains: query.busqueda, mode: 'insensitive' } },
            { ruc: { contains: query.busqueda } },
          ],
        }),
      },
      include: { _count: { select: { personas: { where: { estado: 'activo' } } } } },
      orderBy: { razonSocial: 'asc' },
    });
    return empresas.map(({ _count, ...empresa }) => ({ ...empresa, personalActivo: _count.personas }));
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return empresa;
  }

  async update(id: number, dto: UpdateEmpresaDto, usuarioId: number) {
    const actual = await this.findOne(id);
    if (dto.ruc && dto.ruc !== actual.ruc && (await this.prisma.empresa.findUnique({ where: { ruc: dto.ruc } }))) {
      throw new ConflictException('Ya existe una empresa registrada con ese RUC');
    }
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

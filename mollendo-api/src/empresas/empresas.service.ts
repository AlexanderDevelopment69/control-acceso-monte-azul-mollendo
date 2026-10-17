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

  /**
   * Con cuántas personas activas tiene cada una (vista Empresas y aviso al
   * desactivar) y si se puede eliminar (sin personas, ni dadas de baja, ni usuarios).
   */
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
      include: { _count: { select: { personas: true, usuarios: true } } },
      orderBy: { razonSocial: 'asc' },
    });
    const activos = await this.prisma.persona.groupBy({ by: ['empresaId'], where: { estado: 'activo' }, _count: true });
    const activosPorEmpresa = new Map(activos.map((a) => [a.empresaId, a._count]));
    return empresas.map(({ _count, ...empresa }) => ({
      ...empresa,
      personalActivo: activosPorEmpresa.get(empresa.id) ?? 0,
      eliminable: _count.personas === 0 && _count.usuarios === 0,
    }));
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

  /**
   * Elimina una empresa sin historial: solo si no tiene ninguna persona (ni
   * dada de baja) ni usuarios, p. ej. una creada por error. Las demás se
   * desactivan: su personal, sus documentos y sus ingresos dependen de ella.
   */
  async remove(id: number, usuarioId: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: { _count: { select: { personas: true, usuarios: true } } },
    });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
    if (empresa._count.personas > 0) {
      throw new ConflictException('Tiene personal registrado (activo o dado de baja): se puede desactivar, no eliminar');
    }
    if (empresa._count.usuarios > 0) {
      throw new ConflictException('Tiene usuarios del portal: se puede desactivar, no eliminar');
    }
    await this.prisma.empresa.delete({ where: { id } });
    await this.auditoriaService.registrar({
      usuarioId,
      tablaAfectada: 'empresa',
      registroId: id,
      accion: 'eliminar',
    });
    return { id, razonSocial: empresa.razonSocial };
  }
}

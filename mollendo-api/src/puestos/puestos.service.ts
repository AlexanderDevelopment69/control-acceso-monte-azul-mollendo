import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreatePuestoDto } from './dto/create-puesto.dto.js';
import type { SetRequisitosDto } from './dto/set-requisitos.dto.js';

@Injectable()
export class PuestosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(dto: CreatePuestoDto, usuarioId: number) {
    const existente = await this.prisma.puesto.findUnique({
      where: { nombre_caso: { nombre: dto.nombre, caso: dto.caso } },
    });
    if (existente) {
      throw new ConflictException('Ya existe un puesto con ese nombre para ese caso');
    }

    const puesto = await this.prisma.puesto.create({ data: dto });
    await this.auditoriaService.registrar({
      usuarioId,
      tablaAfectada: 'puesto',
      registroId: puesto.id,
      accion: 'crear',
    });
    return puesto;
  }

  async findAll() {
    return this.prisma.puesto.findMany({ orderBy: [{ caso: 'asc' }, { nombre: 'asc' }] });
  }

  async findOne(id: number) {
    const puesto = await this.prisma.puesto.findUnique({ where: { id } });
    if (!puesto) {
      throw new NotFoundException('Puesto no encontrado');
    }
    return puesto;
  }

  async findRequisitos(puestoId: number) {
    await this.findOne(puestoId);
    return this.prisma.requisitoPorPuesto.findMany({
      where: { puestoId },
      include: { tipoDocumento: true },
    });
  }

  async setRequisitos(puestoId: number, dto: SetRequisitosDto, usuarioId: number) {
    await this.findOne(puestoId);

    await this.prisma.$transaction([
      this.prisma.requisitoPorPuesto.deleteMany({ where: { puestoId } }),
      ...dto.requisitos.map((r) =>
        this.prisma.requisitoPorPuesto.create({
          data: { puestoId, tipoDocumentoId: r.tipoDocumentoId, obligatorio: r.obligatorio },
        }),
      ),
    ]);

    await this.auditoriaService.registrar({
      usuarioId,
      tablaAfectada: 'requisito_por_puesto',
      registroId: puestoId,
      accion: 'modificar',
    });

    return this.findRequisitos(puestoId);
  }
}

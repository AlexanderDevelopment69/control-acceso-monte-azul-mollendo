import { randomBytes } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailerService } from '../common/mailer/mailer.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreateEmpresaDto } from './dto/create-empresa.dto.js';
import type { UpdateEmpresaDto } from './dto/update-empresa.dto.js';
import type { QueryEmpresasDto } from './dto/query-empresas.dto.js';

const INVITACION_EXPIRA_MS = 48 * 60 * 60 * 1000; // 48 horas

@Injectable()
export class EmpresasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
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

  async invitar(id: number) {
    const empresa = await this.findOne(id);

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { correo: empresa.correoContacto },
    });
    if (usuarioExistente?.estadoCuenta === 'activo') {
      throw new BadRequestException('El representante de esta empresa ya activó su cuenta');
    }

    const token = randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + INVITACION_EXPIRA_MS);

    if (usuarioExistente) {
      await this.prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: { tokenInvitacion: token, tokenExpira, estadoCuenta: 'invitado' },
      });
    } else {
      await this.prisma.usuario.create({
        data: {
          empresaId: empresa.id,
          rol: 'empresa',
          correo: empresa.correoContacto,
          estadoCuenta: 'invitado',
          tokenInvitacion: token,
          tokenExpira,
        },
      });
    }

    const enlace = `${process.env.CORS_ORIGIN}/activar-cuenta?token=${token}`;
    await this.mailerService.enviarInvitacionEmpresa(empresa.correoContacto, enlace);

    return { mensaje: 'Invitación enviada correctamente' };
  }
}

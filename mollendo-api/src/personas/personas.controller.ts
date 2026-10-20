import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { fotosMulterOptions } from './fotos-storage.util.js';
import { miniaturaFoto } from './miniatura-foto.util.js';
import { opcionesArchivo } from '../common/archivos-persona.util.js';
import { CargaMasivaService } from './carga-masiva/carga-masiva.service.js';
import { FilasConErrorDto, RegistrarCargaMasivaDto } from './carga-masiva/carga-masiva.dto.js';
import { PersonasService } from './personas.service.js';
import { CreatePersonaDto } from './dto/create-persona.dto.js';
import { UpdatePersonaDto } from './dto/update-persona.dto.js';
import { UpdateEstadoPersonaDto } from './dto/update-estado-persona.dto.js';
import { QueryPersonasDto } from './dto/query-personas.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

// Excel (.xlsx); algunos navegadores lo envían como binario genérico (se revisa al leerlo).
const TIPOS_EXCEL = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'];

const excel = (contenido: Buffer, nombre: string) =>
  new StreamableFile(contenido, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    disposition: `attachment; filename="${nombre}"`,
    length: contenido.length,
  });

@Controller('personas')
export class PersonasController {
  constructor(
    private readonly personasService: PersonasService,
    private readonly cargaMasiva: CargaMasivaService,
  ) {}

  @Post()
  @Roles('administrador')
  create(@Body() dto: CreatePersonaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.personasService.create(dto, user);
  }

  // Carga masiva (antes de las rutas con :id). Plantilla de Excel para llenar.
  @Get('carga-masiva/plantilla')
  @Roles('administrador')
  async plantillaCargaMasiva(): Promise<StreamableFile> {
    return excel(await this.cargaMasiva.plantilla(), 'plantilla-carga-personal.xlsx');
  }

  // Revisa el Excel sin guardar nada: cada fila lista, ya registrada o con error.
  @Post('carga-masiva/revisar')
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('archivo', opcionesArchivo(TIPOS_EXCEL, 5 * 1024 * 1024, 'El archivo debe ser un Excel (.xlsx)')))
  revisarCargaMasiva(@UploadedFile() archivo: Express.Multer.File) {
    if (!archivo) throw new BadRequestException('Elija el Excel con el personal');
    return this.cargaMasiva.revisar(archivo.buffer);
  }

  // Registra las filas que la revisión dio por listas.
  @Post('carga-masiva')
  @Roles('administrador')
  registrarCargaMasiva(@Body() dto: RegistrarCargaMasivaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cargaMasiva.registrar(dto.personas, user);
  }

  // Las filas con error en la plantilla, con su motivo, para corregirlas y volver a subirlas.
  @Post('carga-masiva/errores')
  @Roles('administrador')
  async erroresCargaMasiva(@Body() dto: FilasConErrorDto): Promise<StreamableFile> {
    return excel(await this.cargaMasiva.plantilla(dto.filas), 'carga-personal-errores.xlsx');
  }

  @Get()
  @Roles('administrador', 'vigilancia')
  findAll(@Query() query: QueryPersonasDto) {
    return this.personasService.findAll(query);
  }

  @Get(':id')
  @Roles('administrador', 'vigilancia')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personasService.update(id, dto, user);
  }

  @Patch(':id/estado')
  @Roles('administrador')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoPersonaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personasService.updateEstado(id, dto, user);
  }

  // Foto para el reconocimiento facial (reemplaza la anterior).
  @Post(':id/foto')
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('foto', fotosMulterOptions))
  subirFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!foto) {
      throw new BadRequestException('La foto es obligatoria');
    }
    return this.personasService.guardarFoto(id, foto, user);
  }

  @Get(':id/foto')
  @Roles('administrador', 'vigilancia')
  async verFoto(
    @Param('id', ParseIntPipe) id: number,
    @Query('miniatura') miniatura: string | undefined,
    @Res() res: Response,
  ) {
    const ruta = await this.personasService.rutaFoto(id);
    // ?miniatura=1: reducida (160 px) para las listas; sin él, la foto como se subió.
    if (miniatura === '1') res.type('image/jpeg').send(await miniaturaFoto(ruta));
    else res.sendFile(ruta);
  }
}

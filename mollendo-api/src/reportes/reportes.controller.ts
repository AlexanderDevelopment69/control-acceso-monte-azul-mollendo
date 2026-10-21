import { BadRequestException, Controller, Get, Logger, Param, Query, StreamableFile } from '@nestjs/common';
import { ZipArchive } from 'archiver';
import { Roles } from '../common/decorators/roles.decorator.js';
import { QueryReporteDto, TIPOS_REPORTE, type TipoReporte } from './dto/query-reporte.dto.js';
import { ReportesService } from './reportes.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import { generarExcel } from './reporte-excel.js';
import { generarPdf } from './reporte-pdf.js';

const TIPO_ARCHIVO = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
  zip: 'application/zip',
} as const;

/** Hora local en 4 cifras: 17:50 → "1750". */
const horaMinuto = (fecha: Date) => `${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}`;

@Controller('reportes')
export class ReportesController {
  private readonly logger = new Logger(ReportesController.name);

  constructor(
    private readonly reportesService: ReportesService,
    private readonly auditoria: AuditoriaService,
  ) {}

  /** En la Auditoría: quién descargó qué reporte, en qué formato y con qué filtros. */
  private async auditarDescarga(usuarioId: number, titulo: string, formato: string, filtros: string[]) {
    await this.auditoria.registrar({
      usuarioId,
      tablaAfectada: 'reporte',
      registroId: 0,
      accion: 'descarga',
      detalle: [`${titulo} (${formato.toUpperCase()})`, ...filtros].join(' · ').slice(0, 200),
    });
  }

  /**
   * Descarga un reporte en Excel o PDF: personal, documentos, movimientos,
   * visitas, presentes o auditoria. Documentos también en ZIP (el Excel más
   * los archivos). Solo Administrador.
   */
  @Get(':tipo')
  @Roles('administrador')
  async descargar(@Param('tipo') tipo: string, @Query() query: QueryReporteDto, @CurrentUser() usuario: AuthenticatedUser): Promise<StreamableFile> {
    if (!TIPOS_REPORTE.includes(tipo as TipoReporte)) {
      throw new BadRequestException(`Reporte desconocido. Opciones: ${TIPOS_REPORTE.join(', ')}`);
    }
    if (query.formato === 'zip') {
      if (tipo !== 'documentos') throw new BadRequestException('El formato ZIP solo está disponible para el reporte de documentos');
      return this.zipDocumentos(query, usuario.id);
    }
    const reporte = await this.reportesService.generar(tipo as TipoReporte, query);
    const generado = new Date();
    const contenido = query.formato === 'pdf' ? await generarPdf(reporte, generado) : await generarExcel(reporte, generado);
    await this.auditarDescarga(usuario.id, reporte.titulo, query.formato, reporte.filtros);
    return new StreamableFile(contenido, {
      type: TIPO_ARCHIVO[query.formato],
      disposition: `attachment; filename="${reporte.archivo}.${query.formato}"`,
      length: contenido.length,
    });
  }

  /**
   * ZIP con el Excel de documentos y sus archivos en carpetas por empresa y
   * persona. Se arma mientras se envía (los archivos no se cargan en memoria).
   */
  private async zipDocumentos(query: QueryReporteDto, usuarioId: number): Promise<StreamableFile> {
    const { reporte, archivos } = await this.reportesService.documentosConArchivos(query);
    await this.auditarDescarga(usuarioId, `${reporte.titulo} con archivos`, 'zip', reporte.filtros);
    const generado = new Date();
    const excel = await generarExcel(reporte, generado);
    // Los PDF e imágenes ya vienen comprimidos: compresión baja para no gastar CPU de más.
    const zip = new ZipArchive({ zlib: { level: 1 } });
    zip.on('warning', (error) => this.logger.warn(`ZIP de documentos: ${error.message}`));
    zip.on('error', (error) => this.logger.error(`ZIP de documentos: ${error.message}`));
    zip.append(excel, { name: 'reporte-documentos.xlsx' });
    for (const archivo of archivos) zip.file(archivo.ruta, { name: archivo.enZip });
    void zip.finalize();
    return new StreamableFile(zip, {
      type: TIPO_ARCHIVO.zip,
      // Con la hora (documentos-2026-10-01_1750.zip): si se descarga más de una vez
      // el mismo día, el navegador no le agrega " (1)" al nombre.
      disposition: `attachment; filename="${reporte.archivo.replace('reporte-', '')}_${horaMinuto(generado)}.zip"`,
    });
  }
}

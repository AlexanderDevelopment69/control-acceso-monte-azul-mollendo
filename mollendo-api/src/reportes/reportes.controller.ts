import { BadRequestException, Controller, Get, Logger, Param, Query, StreamableFile } from '@nestjs/common';
import { ZipArchive } from 'archiver';
import { Roles } from '../common/decorators/roles.decorator.js';
import { QueryReporteDto, TIPOS_REPORTE, type TipoReporte } from './dto/query-reporte.dto.js';
import { ReportesService } from './reportes.service.js';
import { generarExcel } from './reporte-excel.js';
import { generarPdf } from './reporte-pdf.js';

const TIPO_ARCHIVO = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
  zip: 'application/zip',
} as const;

@Controller('reportes')
export class ReportesController {
  private readonly logger = new Logger(ReportesController.name);

  constructor(private readonly reportesService: ReportesService) {}

  /**
   * Descarga un reporte en Excel o PDF: personal, documentos, movimientos,
   * visitas, presentes o auditoria. Documentos también en ZIP (el Excel más
   * los archivos). Solo Administrador.
   */
  @Get(':tipo')
  @Roles('administrador')
  async descargar(@Param('tipo') tipo: string, @Query() query: QueryReporteDto): Promise<StreamableFile> {
    if (!TIPOS_REPORTE.includes(tipo as TipoReporte)) {
      throw new BadRequestException(`Reporte desconocido. Opciones: ${TIPOS_REPORTE.join(', ')}`);
    }
    if (query.formato === 'zip') {
      if (tipo !== 'documentos') throw new BadRequestException('El formato ZIP solo está disponible para el reporte de documentos');
      return this.zipDocumentos(query);
    }
    const reporte = await this.reportesService.generar(tipo as TipoReporte, query);
    const generado = new Date();
    const contenido = query.formato === 'pdf' ? await generarPdf(reporte, generado) : await generarExcel(reporte, generado);
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
  private async zipDocumentos(query: QueryReporteDto): Promise<StreamableFile> {
    const { reporte, archivos } = await this.reportesService.documentosConArchivos(query);
    const excel = await generarExcel(reporte, new Date());
    // Los PDF e imágenes ya vienen comprimidos: compresión baja para no gastar CPU de más.
    const zip = new ZipArchive({ zlib: { level: 1 } });
    zip.on('warning', (error) => this.logger.warn(`ZIP de documentos: ${error.message}`));
    zip.on('error', (error) => this.logger.error(`ZIP de documentos: ${error.message}`));
    zip.append(excel, { name: 'reporte-documentos.xlsx' });
    for (const archivo of archivos) zip.file(archivo.ruta, { name: archivo.enZip });
    void zip.finalize();
    return new StreamableFile(zip, {
      type: TIPO_ARCHIVO.zip,
      disposition: `attachment; filename="${reporte.archivo.replace('reporte-', '')}.zip"`,
    });
  }
}

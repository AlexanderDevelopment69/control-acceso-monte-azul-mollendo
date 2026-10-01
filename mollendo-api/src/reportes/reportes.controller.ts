import { BadRequestException, Controller, Get, Param, Query, StreamableFile } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';
import { QueryReporteDto, TIPOS_REPORTE, type TipoReporte } from './dto/query-reporte.dto.js';
import { ReportesService } from './reportes.service.js';
import { generarExcel } from './reporte-excel.js';
import { generarPdf } from './reporte-pdf.js';

const TIPO_ARCHIVO = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
} as const;

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * Descarga un reporte en Excel o PDF: personal, documentos, movimientos,
   * visitas, presentes o auditoria. Solo Administrador.
   */
  @Get(':tipo')
  @Roles('administrador')
  async descargar(@Param('tipo') tipo: string, @Query() query: QueryReporteDto): Promise<StreamableFile> {
    if (!TIPOS_REPORTE.includes(tipo as TipoReporte)) {
      throw new BadRequestException(`Reporte desconocido. Opciones: ${TIPOS_REPORTE.join(', ')}`);
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
}

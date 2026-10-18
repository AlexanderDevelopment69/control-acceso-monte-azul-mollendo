import { ForbiddenException, Injectable, Logger, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { ipEquipoAutorizada, limpiarIp, serieAutorizada } from '../seguridad/equipos.util.js';

/**
 * Rutas /iclock del G4 Pro: el protocolo no manda clave, así que solo se
 * atiende a los terminales cuyo número de serie (?SN=) está en
 * G4PRO_SN_PERMITIDOS. Sin esto, cualquiera que llegue al puerto podría
 * enviar un resultado falso de rostro y alcohol, o registrar equipos falsos.
 */
@Injectable()
export class SerieG4Guard implements CanActivate {
  private readonly logger = new Logger('SerieG4');
  /** Para no llenar el log: un aviso por número de serie rechazado. */
  private readonly avisados = new Set<string>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ query: Record<string, unknown>; socket?: { remoteAddress?: string } }>();
    const sn = req.query?.['SN'];
    // La IP de la conexión, no la de X-Forwarded-For: esa cabecera la puede escribir cualquiera.
    const ip = limpiarIp(req.socket?.remoteAddress);
    const serieOk = serieAutorizada(sn);
    const ipOk = ipEquipoAutorizada(ip);
    if (serieOk && ipOk) return true;
    const clave = `${String(sn)}|${ip}`;
    if (!this.avisados.has(clave) && this.avisados.size < 1000) {
      this.avisados.add(clave);
      const motivo = !serieOk ? 'no está en G4PRO_SN_PERMITIDOS' : 'la IP no está en G4PRO_IPS_PERMITIDAS';
      this.logger.warn(`Terminal rechazado: SN=${String(sn ?? '(sin SN)')} desde ${ip || '?'} (${motivo})`);
    }
    throw new ForbiddenException('Equipo no autorizado');
  }
}

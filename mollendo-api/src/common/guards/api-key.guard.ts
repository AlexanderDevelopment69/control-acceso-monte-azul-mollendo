import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

// Autenticación de los equipos físicos (lector DNI, alcoholímetro, torniquete) —
// no son "usuarios" del portal, así que no tienen JWT. Se validan con una
// clave compartida en vez de con el JwtAuthGuard global (ver spec, sección 2).
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!process.env.DEVICE_API_KEY) {
      throw new UnauthorizedException('DEVICE_API_KEY no configurada en el servidor');
    }
    if (apiKey !== process.env.DEVICE_API_KEY) {
      throw new UnauthorizedException('Clave de equipo inválida');
    }
    return true;
  }
}

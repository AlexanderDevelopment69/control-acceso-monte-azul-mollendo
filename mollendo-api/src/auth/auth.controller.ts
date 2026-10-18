import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { borrarSesion, COOKIE_ACCESO, COOKIE_RENOVACION, guardarSesion, leerCookie } from './cookies-sesion.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Límite de intentos (ver limite-intentos.ts): frena a quien prueba contraseñas.
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const resultado = await this.authService.login(dto, req.ip);
    // El portal usa las cookies; los tokens en el cuerpo quedan para otros clientes (scripts, Swagger).
    guardarSesion(req, res, resultado);
    return resultado;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken ?? leerCookie(req.headers.cookie, COOKIE_RENOVACION);
    if (!token) throw new UnauthorizedException('No hay sesión que renovar');
    const tokens = await this.authService.refreshToken(token);
    guardarSesion(req, res, tokens);
    return tokens;
  }

  /**
   * Qué cookies de sesión trae el navegador (sin validarlas; eso lo hace /cuenta).
   * El portal lo pregunta al cargar: sin ninguna, no hay sesión y no pide /cuenta
   * (que respondería 401, un error en rojo en la consola del navegador).
   */
  @Get('estado')
  estado(@Req() req: Request) {
    return {
      acceso: leerCookie(req.headers.cookie, COOKIE_ACCESO) !== null,
      renovacion: leerCookie(req.headers.cookie, COOKIE_RENOVACION) !== null,
    };
  }

  /** Cierra la sesión del portal: borra sus cookies. */
  @Post('cerrar-sesion')
  @HttpCode(HttpStatus.NO_CONTENT)
  cerrarSesion(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    borrarSesion(req, res);
  }
}

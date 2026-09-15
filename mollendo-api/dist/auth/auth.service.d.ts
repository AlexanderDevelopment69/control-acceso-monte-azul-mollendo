import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailerService } from '../common/mailer/mailer.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { ActivarCuentaDto } from './dto/activar-cuenta.dto.js';
import type { RecuperarPasswordDto } from './dto/recuperar-password.dto.js';
import type { ResetPasswordDto } from './dto/reset-password.dto.js';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly mailerService;
    constructor(prisma: PrismaService, jwtService: JwtService, mailerService: MailerService);
    private buildTokens;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    activarCuenta(dto: ActivarCuentaDto): Promise<{
        mensaje: string;
    }>;
    recuperarPassword(dto: RecuperarPasswordDto): Promise<{
        mensaje: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        mensaje: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}

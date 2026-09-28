import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { CambiarPasswordDto } from './dto/cambiar-password.dto.js';
import type { AuthenticatedUser } from './types/authenticated-user.type.js';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, jwtService: JwtService, auditoriaService: AuditoriaService);
    private buildTokens;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    cambiarPassword(dto: CambiarPasswordDto, user: AuthenticatedUser): Promise<void>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}

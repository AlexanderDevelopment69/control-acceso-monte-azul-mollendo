import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { ActivarCuentaDto } from './dto/activar-cuenta.dto.js';
import { RecuperarPasswordDto } from './dto/recuperar-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}

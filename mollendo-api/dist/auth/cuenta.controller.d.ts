import { AuthService } from './auth.service.js';
import { CambiarPasswordDto } from './dto/cambiar-password.dto.js';
import type { AuthenticatedUser } from './types/authenticated-user.type.js';
export declare class CuentaController {
    private readonly authService;
    constructor(authService: AuthService);
    cambiarPassword(dto: CambiarPasswordDto, user: AuthenticatedUser): Promise<void>;
}

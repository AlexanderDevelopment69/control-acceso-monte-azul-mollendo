import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller.js';
import { CuentaController } from './cuenta.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { asJwtExpiry } from '../common/utils/jwt-expiry.util.js';
import { opcionesLimiteIntentos } from './limite-intentos.js';

@Module({
  imports: [
    PassportModule,
    ThrottlerModule.forRoot(opcionesLimiteIntentos),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: asJwtExpiry(process.env.JWT_EXPIRES_IN ?? '1h') },
    }),
  ],
  controllers: [AuthController, CuentaController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

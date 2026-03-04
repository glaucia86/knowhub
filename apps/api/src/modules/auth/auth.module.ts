import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AUTH_TOKEN_RATE_LIMIT } from './auth-rate-limit.config';
import { AuthController } from './auth.controller';
import { AuthRateLimitService } from './auth-rate-limit.service';
import { AuthService } from './auth.service';
import { AuthAuditService } from './auth-audit.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenRepository } from './refresh-token.repository';
import { KnowHubConfigModule } from '../../config/knowhub-config.module';
import { CredentialStoreService } from '../../config/credential-store.service';

@Module({
  imports: [
    PassportModule,
    KnowHubConfigModule,
    ThrottlerModule.forRoot({
      throttlers: [AUTH_TOKEN_RATE_LIMIT],
    }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    CredentialStoreService,
    RefreshTokenRepository,
    AuthAuditService,
    AuthRateLimitService,
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}

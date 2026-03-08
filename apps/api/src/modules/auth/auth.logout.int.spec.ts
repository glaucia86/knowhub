import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Module, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthRateLimitService } from './auth-rate-limit.service';
import { AuthService } from './auth.service';

class AuthServiceStub {
  mode: 'ok' | 'fail' = 'ok';

  async issueTokenPair(): Promise<never> {
    throw new Error('not used');
  }

  async refreshSession(): Promise<never> {
    throw new Error('not used');
  }

  async logout(): Promise<void> {
    if (this.mode === 'fail') {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}

@Module({
  controllers: [AuthController],
  providers: [
    AuthRateLimitService,
    {
      provide: AuthService,
      useClass: AuthServiceStub,
    },
  ],
})
class AuthTestModule {}

describe('POST /api/v1/auth/logout', () => {
  it('should return 204 when refresh token is revoked', async () => {
    const app = await NestFactory.create(AuthTestModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(0, '127.0.0.1');

    try {
      const address = app.getHttpServer().address() as { port: number };
      const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'valid-token' }),
      });

      assert.equal(response.status, 204);
    } finally {
      await app.close();
    }
  });

  it('should return 401 when refresh token is invalid', async () => {
    const app = await NestFactory.create(AuthTestModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    const authService = app.get(AuthService) as unknown as AuthServiceStub;
    authService.mode = 'fail';
    await app.listen(0, '127.0.0.1');

    try {
      const address = app.getHttpServer().address() as { port: number };
      const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      });

      assert.equal(response.status, 401);
    } finally {
      await app.close();
    }
  });
});

import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthTokenPayload, TokenPairResponse } from '@knowhub/shared-types';
import { getDatabaseClient } from '../../db/database.client';
import { users } from '../../db/schema';
import { CredentialStoreService } from '../../config/credential-store.service';
import { AuthAuditService } from './auth-audit.service';
import { RefreshTokenRepository } from './refresh-token.repository';

interface AuthenticatedPrincipal {
  userId: string;
  clientId: string;
}

/* c8 ignore next */
@Injectable()
export class AuthService {
  private readonly db = getDatabaseClient().db;

  constructor(
    private readonly jwtService: JwtService,
    private readonly credentialStoreService: CredentialStoreService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly authAuditService: AuthAuditService,
  ) {}

  private async resolveDefaultUserId(): Promise<string> {
    const rows = await this.db.select({ id: users.id }).from(users).limit(1);
    if (rows.length === 0) {
      throw new UnauthorizedException('No local user provisioned. Run setup first.');
    }
    return rows[0].id;
  }

  async issueTokenPair(clientId: string, clientSecret: string): Promise<TokenPairResponse> {
    const startedAt = Date.now();
    const expectedSecret = await this.credentialStoreService.getSecret('knowhub', clientId);
    if (!expectedSecret || !this.safeCompareSecret(expectedSecret, clientSecret)) {
      await this.stabilizeFailedAuthLatency(startedAt);
      await this.authAuditService.record('auth_failed', null, clientId, {
        reason: 'INVALID_CREDENTIALS',
      });
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const userId = await this.resolveDefaultUserId();
    const privateKey = await this.credentialStoreService.getSecret('knowhub-rsa', clientId);
    if (!privateKey) {
      throw new UnauthorizedException('Signing key unavailable. Run setup again.');
    }

    const tokenPair = await this.generateAndPersistTokenPair({ userId, clientId }, privateKey);
    await this.authAuditService.record('token_issued', userId, clientId);
    return tokenPair;
  }

  async refreshSession(refreshToken: string): Promise<TokenPairResponse> {
    const tokenHash = RefreshTokenRepository.hashToken(refreshToken);
    const existing = await this.refreshTokenRepository.findActiveByTokenHash(tokenHash);
    if (!existing) {
      await this.authAuditService.record('auth_failed', null, null, { reason: 'INVALID_REFRESH' });
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const tokenPair = await this.generateAndPersistTokenPair(
      {
        userId: existing.userId,
        clientId: existing.clientId,
      },
      await this.resolvePrivateKey(existing.clientId),
    );

    const nextTokenHash = RefreshTokenRepository.hashToken(tokenPair.refreshToken);
    const next = await this.refreshTokenRepository.findActiveByTokenHash(nextTokenHash);
    await this.refreshTokenRepository.revoke(existing.id, 'rotated', next?.id);
    await this.authAuditService.record('token_refresh', existing.userId, existing.clientId);

    return tokenPair;
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = RefreshTokenRepository.hashToken(refreshToken);
    const existing = await this.refreshTokenRepository.findActiveByTokenHash(tokenHash);
    if (!existing) {
      throw new UnauthorizedException('Token de renovação inválido ou expirado.');
    }
    await this.refreshTokenRepository.revoke(existing.id, 'logout');
    await this.authAuditService.record('token_revoked', existing.userId, existing.clientId);
  }

  private async generateAndPersistTokenPair(
    principal: AuthenticatedPrincipal,
    privateKey: string,
  ): Promise<TokenPairResponse> {
    const now = new Date();
    const accessExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    const refreshExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const jwtPayload: AuthTokenPayload = {
      sub: principal.userId,
      clientId: principal.clientId,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: '15m',
      algorithm: 'RS256',
      privateKey,
    });

    const refreshToken = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
    const refreshId = randomUUID();

    await this.refreshTokenRepository.create({
      id: refreshId,
      userId: principal.userId,
      clientId: principal.clientId,
      tokenHash: RefreshTokenRepository.hashToken(refreshToken),
      issuedAt: now,
      expiresAt: refreshExpiresAt,
      revokedAt: null,
      replacedByTokenId: null,
      revokeReason: null,
    });

    return {
      accessToken,
      expiresAt: accessExpiresAt.toISOString(),
      refreshToken,
      refreshExpiresAt: refreshExpiresAt.toISOString(),
      tokenType: 'Bearer',
    };
  }

  private async resolvePrivateKey(clientId: string): Promise<string> {
    const privateKey = await this.credentialStoreService.getSecret('knowhub-rsa', clientId);
    if (!privateKey) {
      throw new UnauthorizedException('Signing key unavailable. Run setup again.');
    }
    return privateKey;
  }

  private safeCompareSecret(expected: string, provided: string): boolean {
    const expectedHash = createHash('sha256').update(expected).digest();
    const providedHash = createHash('sha256').update(provided).digest();
    return timingSafeEqual(expectedHash, providedHash);
  }

  private async stabilizeFailedAuthLatency(startedAt: number): Promise<void> {
    const targetMs = 100;
    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs < targetMs) {
      await new Promise((resolve) => setTimeout(resolve, targetMs - elapsedMs));
    }
  }
}

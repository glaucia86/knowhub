export interface AuthTokenRequest {
  clientId: string;
  clientSecret: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface TokenPairResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  tokenType?: 'Bearer';
}

export interface AuthTokenPayload {
  sub: string;
  clientId: string;
  iat?: number;
  exp?: number;
}

export type AuthAuditEventType = 'token_issued' | 'token_refresh' | 'token_revoked' | 'auth_failed';

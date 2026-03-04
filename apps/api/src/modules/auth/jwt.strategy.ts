import { readFileSync } from 'node:fs';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { KnowHubConfigService } from '../../config/knowhub-config.service';

interface JwtPayload {
  sub: string;
  userId: string;
  clientId: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly knowHubConfigService: KnowHubConfigService) {
    const config = knowHubConfigService.readLocalConfig();
    const publicKey = readFileSync(config.publicKeyPath, 'utf-8');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}

import { IsString, IsUUID, MinLength } from 'class-validator';

export class AuthTokenDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  @MinLength(1)
  clientSecret!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

export class LogoutDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

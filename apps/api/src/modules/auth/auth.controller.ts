import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { AuthTokenDto, LogoutDto, RefreshDto } from './dto/auth.dto';
import { AuthRateLimitService } from './auth-rate-limit.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authRateLimitService: AuthRateLimitService,
  ) {}

  @Public()
  @Post('local-token')
  @ApiOperation({ summary: 'Issue token using server-side local credentials (no body required)' })
  @ApiResponse({ status: 200, description: 'Tokens issued successfully' })
  @ApiResponse({ status: 401, description: 'Setup not completed or credentials unavailable' })
  @ApiResponse({ status: 429, description: 'Too many attempts. Please wait 60 seconds.' })
  async localToken(@Req() req: { ip?: string }) {
    this.authRateLimitService.checkAndConsume(req.ip ?? 'local');
    return this.authService.issueLocalTokenPair();
  }

  @Public()
  @Post('token')
  @ApiOperation({ summary: 'Issue token pairs from local credentials' })
  @ApiResponse({ status: 200, description: 'Tokens issued successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many attempts. Please wait 60 seconds.' })
  async token(@Body() body: AuthTokenDto, @Req() req: { ip?: string }) {
    this.authRateLimitService.checkAndConsume(req.ip ?? 'local');
    return this.authService.issueTokenPair(body.clientId, body.clientSecret);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renew session with refresh token rotation' })
  @ApiResponse({ status: 200, description: 'Session renewed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() body: RefreshDto) {
    return this.authService.refreshSession(body.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'End session and revoke refresh token' })
  @ApiResponse({ status: 204, description: 'Session ended' })
  async logout(@Body() body: LogoutDto): Promise<void> {
    await this.authService.logout(body.refreshToken);
  }
}

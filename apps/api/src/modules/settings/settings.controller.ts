import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get settings for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Settings returned' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  patchSettings(@Body() body: UpdateSettingsDto) {
    return this.settingsService.updateSettings(body);
  }

  @Post('test-ai')
  @ApiOperation({ summary: 'Test connectivity with the current provider/model' })
  @ApiResponse({ status: 200, description: 'Test executed' })
  testAi() {
    return this.settingsService.testAI();
  }

  @Get('ai-models')
  @ApiOperation({ summary: 'List available models for configuration' })
  @ApiResponse({ status: 200, description: 'Models returned' })
  async aiModels() {
    return this.settingsService.listAIModels();
  }
}

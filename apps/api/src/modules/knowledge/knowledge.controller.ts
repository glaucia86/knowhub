import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  CreateKnowledgeEntryDto,
  ListKnowledgeEntriesQueryDto,
  UpdateKnowledgeEntryDto,
} from './dto/knowledge.dto';
import {
  KnowledgeEntryDetailEnvelopeResponseDto,
  KnowledgeEntryEnvelopeResponseDto,
  KnowledgeEntryListResponseDto,
  KnowledgeEntryReindexAcceptedResponseDto,
} from './dto/knowledge-response.dto';
import { KnowledgeService } from './knowledge.service';

@ApiTags('Knowledge')
@ApiBearerAuth()
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a knowledge entry' })
  @ApiCreatedResponse({ description: 'Entry created', type: KnowledgeEntryEnvelopeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 422, description: 'Business validation failed' })
  createEntry(@CurrentUser() userId: string, @Body() body: CreateKnowledgeEntryDto) {
    return this.knowledgeService.createEntry(userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List knowledge entries' })
  @ApiOkResponse({ description: 'Paginated result returned', type: KnowledgeEntryListResponseDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  listEntries(@CurrentUser() userId: string, @Query() query: ListKnowledgeEntriesQueryDto) {
    return this.knowledgeService.listEntries(userId, query);
  }

  @Get(':entryId')
  @ApiOperation({ summary: 'Retrieve a knowledge entry' })
  @ApiOkResponse({ description: 'Entry returned', type: KnowledgeEntryDetailEnvelopeResponseDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  getEntry(@CurrentUser() userId: string, @Param('entryId') entryId: string) {
    return this.knowledgeService.getEntry(userId, entryId);
  }

  @Patch(':entryId')
  @ApiOperation({ summary: 'Update a knowledge entry' })
  @ApiOkResponse({ description: 'Entry updated', type: KnowledgeEntryEnvelopeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @ApiResponse({ status: 409, description: 'Entry is currently indexing' })
  updateEntry(
    @CurrentUser() userId: string,
    @Param('entryId') entryId: string,
    @Body() body: UpdateKnowledgeEntryDto,
  ) {
    return this.knowledgeService.updateEntry(userId, entryId, body);
  }

  @Delete(':entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a knowledge entry' })
  @ApiNoContentResponse({ description: 'Entry archived' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  archiveEntry(@CurrentUser() userId: string, @Param('entryId') entryId: string) {
    return this.knowledgeService.archiveEntry(userId, entryId);
  }

  @Post(':entryId/reindex')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request reindexing for a knowledge entry' })
  @ApiAcceptedResponse({
    description: 'Reindex accepted',
    type: KnowledgeEntryReindexAcceptedResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @ApiResponse({ status: 409, description: 'Entry is already pending or indexing' })
  @ApiResponse({ status: 422, description: 'Archived entries cannot be reindexed' })
  reindexEntry(@CurrentUser() userId: string, @Param('entryId') entryId: string) {
    return this.knowledgeService.reindexEntry(userId, entryId);
  }
}

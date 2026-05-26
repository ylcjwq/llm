import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchService } from '../embedding/search.service';

@Controller('api/search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Post()
  async search(@Request() req, @Body() body: { query: string; topK?: number }) {
    const topK = body.topK || 5;
    return this.searchService.similaritySearch(
      body.query,
      req.user.userId,
      topK,
    );
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublishService } from '../services/publish.service';

@ApiTags('内容发布')
@Controller('publish')
export class PublishController {
  constructor(private readonly publishService: PublishService) {}

  @Post()
  @ApiOperation({ summary: '发布内容' })
  async publish(@Body() data: any) {
    return this.publishService.publish(data);
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { XiaoZhiService } from '../services/xiaozhi.service';
import { XiaoZhiChatDto } from '../dto/xiaozhi-chat.dto';

@ApiTags('小智机器人')
@Controller('xiaozhi')
export class XiaoZhiController {
  constructor(private readonly xiaozhiService: XiaoZhiService) {}

  @Post('chat')
  @ApiOperation({ summary: '小智对话' })
  @ApiResponse({ status: 200, description: '返回AI回复' })
  async chat(@Body() dto: XiaoZhiChatDto) {
    return this.xiaozhiService.chat(dto.message, dto.history);
  }
}

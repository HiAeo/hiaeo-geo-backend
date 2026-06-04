import { Module } from '@nestjs/common';
import { XiaoZhiController } from './controllers/xiaozhi.controller';
import { XiaoZhiService } from './services/xiaozhi.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [XiaoZhiController],
  providers: [XiaoZhiService],
})
export class XiaoZhiModule {}

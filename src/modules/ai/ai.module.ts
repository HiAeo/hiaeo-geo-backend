import { Module } from '@nestjs/common';
import { AiController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';
import { EngineManager } from './adapters/engine-manager';
import { DeepseekAdapter } from './adapters/deepseek.adapter';
import { KimiAdapter } from './adapters/kimi.adapter';
import { QwenAdapter } from './adapters/qwen.adapter';
import { ZhipuAdapter } from './adapters/zhipu.adapter';
import { DoubaoAdapter } from './adapters/doubao.adapter';
import { WenxinAdapter } from './adapters/wenxin.adapter';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    EngineManager,
    DeepseekAdapter,
    KimiAdapter,
    QwenAdapter,
    ZhipuAdapter,
    DoubaoAdapter,
    WenxinAdapter,
  ],
  exports: [AiService, EngineManager],
})
export class AiModule {}

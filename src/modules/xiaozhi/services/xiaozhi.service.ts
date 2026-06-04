import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/services/ai.service';

const XIAOZHI_SYSTEM_PROMPT = `你是"小智"，360智见的AI智能助手。你的职责是帮助用户解答关于以下领域的问题：

1. **GEO（生成式引擎优化）**：解释GEO概念、最佳实践、与SEO的区别
2. **360智见产品**：介绍360智见的功能、使用方法、定价等
3. **AI搜索优化**：如何在AI搜索引擎中提升品牌可见度
4. **品牌建设**：品牌在AI时代的定位和传播策略

回答要求：
- 用中文回答，语言简洁友好
- 如果问题超出你的知识范围，诚实说明
- 不要提及任何其他产品或竞争对手
- 保持专业但平易近人的语气`;

@Injectable()
export class XiaoZhiService {
  constructor(private readonly aiService: AiService) {}

  async chat(message: string, history?: Array<{ role: string; content: string }>) {
    const messages = [];

    // 构建消息数组：system + history + current message
    const allMessages = [
      ...(history || []).map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    try {
      const result = await this.aiService.chat({
        messages: allMessages,
        systemPrompt: XIAOZHI_SYSTEM_PROMPT,
        temperature: 0.7,
        maxTokens: 1000,
      });

      return {
        reply: result.message?.content || '抱歉，我暂时无法回答这个问题。',
        success: true,
      };
    } catch (error) {
      return {
        reply: '抱歉，AI服务暂时不可用，请稍后再试。',
        success: false,
      };
    }
  }
}

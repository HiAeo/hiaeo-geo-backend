import { AiService } from '../services/ai.service';
import { DiagnoseBrandDto } from '../dto/diagnose-brand.dto';
import { GenerateContentDto } from '../dto/generate-content.dto';
import { ChatDto } from '../dto/chat.dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    getEngineList(): Promise<{
        name: string;
        displayName: string;
    }[]>;
    getEngineHealthStatus(): Promise<import("../adapters").EngineHealthStatus[]>;
    recommendEngine(taskType: 'diagnosis' | 'content' | 'chat'): Promise<string>;
    diagnose(dto: DiagnoseBrandDto, engine?: string): Promise<import("../adapters").BrandDiagnosisResult>;
    diagnoseBatch(dto: DiagnoseBrandDto): Promise<import("../adapters").AggregatedDiagnosisResult>;
    generateContent(dto: GenerateContentDto, engine?: string): Promise<import("../adapters").ContentGenerationResult>;
    chat(dto: ChatDto, engine?: string): Promise<import("../adapters").ChatResult>;
}

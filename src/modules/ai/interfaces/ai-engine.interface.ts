export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BrandDiagnosisParams {
  brandName: string;
  productDescription?: string;
  competitors?: string[];
  marketContext?: string;
}

export interface BrandDiagnosisResult {
  brandPositioning: string;
  competitiveAdvantages: string[];
  potentialIssues: string[];
  marketOpportunities: string[];
  contentSuggestions: string[];
  confidence: number;
}

export interface ContentGenerationParams {
  topic: string;
  contentType: 'social_post' | 'article' | 'ad_copy' | 'product_description';
  tone?: 'professional' | 'casual' | 'humorous' | 'inspirational';
  targetAudience?: string;
  keywords?: string[];
  maxLength?: number;
}

export interface ContentGenerationResult {
  title: string;
  content: string;
  tags: string[];
  suggestedImages?: string[];
  platform?: string;
}

export interface ChatParams {
  messages: Message[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResult {
  message: Message;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIEngineAdapter {
  readonly name: string;
  diagnoseBrand(params: BrandDiagnosisParams): Promise<BrandDiagnosisResult>;
  generateContent(params: ContentGenerationParams): Promise<ContentGenerationResult>;
  chat(params: ChatParams): Promise<ChatResult>;
}

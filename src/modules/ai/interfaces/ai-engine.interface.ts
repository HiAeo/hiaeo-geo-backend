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

export interface SEODiagnosisParams {
  targetUrl: string;
  targetName?: string;
  targetIndustry?: string;
  keywords?: string[];
}

export interface SEODiagnosisResult {
  seoScore: {
    overall: number;
    technical: number;
    content: number;
    authority: number;
    performance: number;
  };
  issues: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    recommendation: string;
  }>;
  aiSearchPresence: {
    score: number;
    coverage: number;
    mentions: number;
    sentiment: string;
  };
  summary: string;
}

export interface AIEngineAdapter {
  readonly name: string;
  diagnoseBrand(params: BrandDiagnosisParams): Promise<BrandDiagnosisResult>;
  diagnoseSEO(params: SEODiagnosisParams): Promise<SEODiagnosisResult>;
  generateContent(params: ContentGenerationParams): Promise<ContentGenerationResult>;
  chat(params: ChatParams): Promise<ChatResult>;
  isAvailable(): boolean;
}

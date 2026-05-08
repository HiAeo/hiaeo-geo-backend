export declare class ChatMessageDto {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare class ChatDto {
    messages: ChatMessageDto[];
    temperature?: number;
    maxTokens?: number;
}

import { SemanticService } from '../services/semantic.service';
export declare class SemanticController {
    private readonly semanticService;
    constructor(semanticService: SemanticService);
    getLibrary(): Promise<any>;
    analyze(data: any): Promise<any>;
}

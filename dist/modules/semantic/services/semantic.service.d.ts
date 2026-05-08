import { SemanticEntityService } from './semantic-entity.service';
import { TemplateService } from './template.service';
import { StyleAdapterService } from './style-adapter.service';
export declare class SemanticService {
    private readonly entityService;
    private readonly templateService;
    private readonly styleService;
    constructor(entityService: SemanticEntityService, templateService: TemplateService, styleService: StyleAdapterService);
    analyze(text: string): Promise<any>;
    getLibrary(): Promise<any>;
    generateFromTemplate(templateId: number, variables: Record<string, any>): Promise<string>;
}

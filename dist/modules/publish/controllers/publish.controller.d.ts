import { PublishService } from '../services/publish.service';
export declare class PublishController {
    private readonly publishService;
    constructor(publishService: PublishService);
    publish(data: any): Promise<any>;
}

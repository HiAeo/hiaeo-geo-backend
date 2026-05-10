import { WorkflowTriggerType } from '../entities/workflow-definition.entity';
import { WorkflowConditionDto, WorkflowActionDto } from './create-workflow.dto';
export declare class UpdateWorkflowDto {
    name?: string;
    description?: string;
    triggerType?: WorkflowTriggerType;
    conditions?: WorkflowConditionDto[];
    actions?: WorkflowActionDto[];
    isEnabled?: boolean;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPermissionDto = exports.SetKnowledgeScopeDto = exports.AssignRoleDto = exports.UpdateRoleDto = exports.CreateRoleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateRoleDto {
}
exports.CreateRoleDto = CreateRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色名称', example: 'EDITOR' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: '角色名称至少2个字符' }),
    (0, class_validator_1.MaxLength)(50, { message: '角色名称最多50个字符' }),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色描述', example: '内容编辑角色' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: '角色描述最多100个字符' }),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '权限列表', example: ['knowledge:read', 'knowledge:write'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateRoleDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否为系统内置角色', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRoleDto.prototype, "isSystem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '角色级别', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Number)
], CreateRoleDto.prototype, "level", void 0);
class UpdateRoleDto {
}
exports.UpdateRoleDto = UpdateRoleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '角色名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '角色描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '权限列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateRoleDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否激活' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRoleDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '角色级别' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateRoleDto.prototype, "level", void 0);
class AssignRoleDto {
}
exports.AssignRoleDto = AssignRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '知识库访问范围（ID列表）', example: ['uuid1', 'uuid2'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AssignRoleDto.prototype, "knowledgeScope", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '过期时间' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], AssignRoleDto.prototype, "expiresAt", void 0);
class SetKnowledgeScopeDto {
}
exports.SetKnowledgeScopeDto = SetKnowledgeScopeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SetKnowledgeScopeDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '知识库ID列表', example: ['uuid1', 'uuid2'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SetKnowledgeScopeDto.prototype, "knowledgeIds", void 0);
class CheckPermissionDto {
}
exports.CheckPermissionDto = CheckPermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '要检查的权限', example: 'knowledge:read' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckPermissionDto.prototype, "permission", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '资源ID（用于知识库级别的权限检查）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckPermissionDto.prototype, "resourceId", void 0);
//# sourceMappingURL=role.dto.js.map
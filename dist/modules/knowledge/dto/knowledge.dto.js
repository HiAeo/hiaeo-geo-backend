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
exports.SimilarKnowledgeBaseDto = exports.VectorIndexStatusDto = exports.SemanticSearchResponseDto = exports.SemanticSearchDto = exports.DiagnosisSuggestionDto = exports.ManualTriggerDiagnosisDto = exports.IncrementalDiagnosisResponseDto = exports.IncrementalDiagnosisTriggerDto = exports.KeywordSuggestionDto = exports.CompletenessReportDto = exports.ExtractFromTextResponseDto = exports.ExtractFromTextDto = exports.ExtractFromUrlResponseDto = exports.ExtractFromUrlDto = exports.EnhancedSuggestionResponseDto = exports.EnhancedFieldSuggestionDto = exports.AiSuggestResponseDto = exports.AiSuggestDto = exports.KnowledgeVersionDto = exports.FileUploadResponseDto = exports.CreateKnowledgeBaseDto = exports.UpdateKnowledgeBaseDto = exports.GetKnowledgeBaseDto = void 0;
const class_validator_1 = require("class-validator");
class GetKnowledgeBaseDto {
}
exports.GetKnowledgeBaseDto = GetKnowledgeBaseDto;
class UpdateKnowledgeBaseDto {
}
exports.UpdateKnowledgeBaseDto = UpdateKnowledgeBaseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateKnowledgeBaseDto.prototype, "basicInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateKnowledgeBaseDto.prototype, "bizPositioning", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateKnowledgeBaseDto.prototype, "productService", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateKnowledgeBaseDto.prototype, "competitorMarket", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateKnowledgeBaseDto.prototype, "geoGoals", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateKnowledgeBaseDto.prototype, "supplement", void 0);
class CreateKnowledgeBaseDto {
}
exports.CreateKnowledgeBaseDto = CreateKnowledgeBaseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKnowledgeBaseDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateKnowledgeBaseDto.prototype, "basicInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateKnowledgeBaseDto.prototype, "bizPositioning", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateKnowledgeBaseDto.prototype, "productService", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateKnowledgeBaseDto.prototype, "geoGoals", void 0);
class FileUploadResponseDto {
}
exports.FileUploadResponseDto = FileUploadResponseDto;
class KnowledgeVersionDto {
}
exports.KnowledgeVersionDto = KnowledgeVersionDto;
class AiSuggestDto {
}
exports.AiSuggestDto = AiSuggestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiSuggestDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiSuggestDto.prototype, "sourceUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiSuggestDto.prototype, "sourceText", void 0);
class AiSuggestResponseDto {
}
exports.AiSuggestResponseDto = AiSuggestResponseDto;
class EnhancedFieldSuggestionDto {
}
exports.EnhancedFieldSuggestionDto = EnhancedFieldSuggestionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnhancedFieldSuggestionDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnhancedFieldSuggestionDto.prototype, "context", void 0);
class EnhancedSuggestionResponseDto {
}
exports.EnhancedSuggestionResponseDto = EnhancedSuggestionResponseDto;
class ExtractFromUrlDto {
}
exports.ExtractFromUrlDto = ExtractFromUrlDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExtractFromUrlDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExtractFromUrlDto.prototype, "targetField", void 0);
class ExtractFromUrlResponseDto {
}
exports.ExtractFromUrlResponseDto = ExtractFromUrlResponseDto;
class ExtractFromTextDto {
}
exports.ExtractFromTextDto = ExtractFromTextDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExtractFromTextDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExtractFromTextDto.prototype, "targetFields", void 0);
class ExtractFromTextResponseDto {
}
exports.ExtractFromTextResponseDto = ExtractFromTextResponseDto;
class CompletenessReportDto {
}
exports.CompletenessReportDto = CompletenessReportDto;
class KeywordSuggestionDto {
}
exports.KeywordSuggestionDto = KeywordSuggestionDto;
class IncrementalDiagnosisTriggerDto {
}
exports.IncrementalDiagnosisTriggerDto = IncrementalDiagnosisTriggerDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IncrementalDiagnosisTriggerDto.prototype, "changedFields", void 0);
class IncrementalDiagnosisResponseDto {
}
exports.IncrementalDiagnosisResponseDto = IncrementalDiagnosisResponseDto;
class ManualTriggerDiagnosisDto {
}
exports.ManualTriggerDiagnosisDto = ManualTriggerDiagnosisDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ManualTriggerDiagnosisDto.prototype, "dimensions", void 0);
class DiagnosisSuggestionDto {
}
exports.DiagnosisSuggestionDto = DiagnosisSuggestionDto;
class SemanticSearchDto {
}
exports.SemanticSearchDto = SemanticSearchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SemanticSearchDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SemanticSearchDto.prototype, "topK", void 0);
class SemanticSearchResponseDto {
}
exports.SemanticSearchResponseDto = SemanticSearchResponseDto;
class VectorIndexStatusDto {
}
exports.VectorIndexStatusDto = VectorIndexStatusDto;
class SimilarKnowledgeBaseDto {
}
exports.SimilarKnowledgeBaseDto = SimilarKnowledgeBaseDto;
//# sourceMappingURL=knowledge.dto.js.map
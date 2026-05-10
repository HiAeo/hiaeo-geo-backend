"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeAccess = exports.RequirePermissions = exports.RequirePermission = exports.KNOWLEDGE_ACCESS_KEY = exports.PERMISSION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSION_KEY = 'permissions';
exports.KNOWLEDGE_ACCESS_KEY = 'knowledge_access';
const RequirePermission = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSION_KEY, permissions);
exports.RequirePermission = RequirePermission;
const RequirePermissions = (permissions) => (0, common_1.SetMetadata)(exports.PERMISSION_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
const KnowledgeAccess = () => (0, common_1.SetMetadata)(exports.KNOWLEDGE_ACCESS_KEY, true);
exports.KnowledgeAccess = KnowledgeAccess;
//# sourceMappingURL=permission.decorator.js.map
"use strict";
import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/**
 * 权限装饰器 - 标记需要的权限
 */
export const RequirePermission = (...permissions: string[]) => 
  SetMetadata(PERMISSION_KEY, permissions);

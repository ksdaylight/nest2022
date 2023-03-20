import { MongoAbility } from '@casl/ability';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FastifyRequest as Request } from 'fastify';
import { isNil, isArray } from 'lodash';
import { ObjectLiteral } from 'typeorm';

import { CrudMethodOption } from '../restful/types';

import { PermissionAction } from './constants';
import { ManualPermission } from './decorators/permission.decorator';
import { PermissionChecker } from './types';

/**
 * 获取请求中的items,item,id,用于crud操作时验证数据
 * @param request
 */
export const getRequestItems = (request?: Request): string[] => {
    const { params = {}, body = {} } = (request ?? {}) as any;
    const id = params.id ?? body.id ?? params.item ?? body.item;
    const { items } = body;
    if (!isNil(id)) return [id];
    return !isNil(items) && isArray(items) ? items : [];
};

/**
 * 验证是否是数据拥有者
 * @param ability
 * @param getModels
 * @param request
 * @param permission
 */
export const checkOwner = async <E extends ObjectLiteral>(
    ability: MongoAbility,
    getModels: (items: string[]) => Promise<E[]>,
    request?: Request,
    permission?: string,
) => {
    const models = await getModels(getRequestItems(request));
    return models.every((model) => ability.can(permission ?? PermissionAction.OWNER, model));
};

/**
 * 快速生成常用CRUD装饰器选项
 * @param permissions
 * @param apiSummary
 */
export const simpleCurdOption = (
    permissions?: PermissionChecker[],
    apiSummary?: string,
    guest?: boolean,
    apiBearerAuth?: boolean,
): CrudMethodOption => ({
    allowGuest: guest,
    hook: (target, method) => {
        if (permissions) ManualPermission(target, method, permissions);
        if (apiSummary) {
            ApiOperation({ summary: apiSummary })(
                target,
                method,
                Object.getOwnPropertyDescriptor(target.prototype, method),
            );
        }
        if (apiBearerAuth) {
            ApiBearerAuth()(
                target,
                method,
                Object.getOwnPropertyDescriptor(target.prototype, method),
            );
        }
    },
});

// export function simpleCurdOption(apiSummary: string): CrudMethodOption;

// export function simpleCurdOption(
//     permissions: PermissionChecker[],
//     apiSummary?: string,
//     apiBearerAuth?: boolean,
// ): CrudMethodOption;

// export function simpleCurdOption(
//     permissionsOrApiSummary: PermissionChecker[] | string,
//     apiSummary?: string,
//     guest?: boolean,
//     apiBearerAuth?: boolean,
// ): CrudMethodOption {
//     let permissions: PermissionChecker[] = [];
//     let mtheodSummary = '';
//     if (typeof permissionsOrApiSummary === 'string') {
//         mtheodSummary = permissionsOrApiSummary;
//     } else {
//         permissions = permissionsOrApiSummary;
//         mtheodSummary = apiSummary;
//     }

//     return {
//         allowGuest: guest ?? false,
//         hook: (target, method) => {
//             if (permissions.length > 0) {
//                 ManualPermission(target, method, permissions);
//             }
//             if (mtheodSummary) {
//                 ApiOperation({ summary: mtheodSummary })(
//                     target,
//                     method,
//                     Object.getOwnPropertyDescriptor(target.prototype, method),
//                 );
//             }
//             if (apiBearerAuth) {
//                 ApiBearerAuth()(
//                     target,
//                     method,
//                     Object.getOwnPropertyDescriptor(target.prototype, method),
//                 );
//             }
//         },
//     };
// }

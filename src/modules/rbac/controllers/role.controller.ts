import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { PermissionAction } from '../constants';
import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from '../dtos/role.dto';
import { RoleEntity } from '../entities/role.entity';
import { createHookOption } from '../helpers';
import { RbacModule } from '../rbac.module';
import { RoleService } from '../services/role.service';
import { PermissionChecker } from '../types';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, RoleEntity.name),
];
@ApiTags('角色管理')
@ApiBearerAuth()
@Depends(RbacModule)
@Crud(() => ({
    id: 'role',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ permissions, summary: '角色查询,以分页模式展示' }),
        },
        { name: 'detail', option: createHookOption({ permissions, summary: '角色详情' }) },
        { name: 'store', option: createHookOption({ permissions, summary: '添加角色' }) },
        { name: 'update', option: createHookOption({ permissions, summary: '修改角色信息' }) },
        {
            name: 'delete',
            option: createHookOption({
                permissions,
                summary: '删除角色,支持批量删除(系统角色不可删除)',
            }),
        },
        {
            name: 'restore',
            option: createHookOption({ permissions, summary: '恢复回收站中的角色,支持批量恢复' }),
        },
    ],
    dtos: {
        list: QueryRoleDto,
        store: CreateRoleDto,
        update: UpdateRoleDto,
    },
}))
@Controller('roles')
export class RoleController extends BaseControllerWithTrash<RoleService> {
    constructor(protected roleService: RoleService) {
        super(roleService);
    }
}

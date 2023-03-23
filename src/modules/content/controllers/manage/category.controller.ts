import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { simpleCrudOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../../content.module';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dtos';
import { CategoryEntity } from '../../entities';

import { CategoryService } from '../../services';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, CategoryEntity.name),
];
/**
 * 分类控制器
 */
@ApiTags('分类管理')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async () => ({
    id: 'category',
    enabled: [
        {
            name: 'list',
            option: simpleCrudOption(permissions, '分类查询,以分页模式展示'),
        },
        { name: 'detail', option: simpleCrudOption(permissions, '分类详情') },
        { name: 'store', option: simpleCrudOption(permissions, '添加分类') },
        { name: 'update', option: simpleCrudOption(permissions, '修改分类信息') },
        { name: 'delete', option: simpleCrudOption(permissions, '删除分类,支持批量删除') },
        {
            name: 'restore',
            option: simpleCrudOption(permissions, '恢复回收站中的分类,支持批量恢复'),
        },
    ],
    dtos: {
        store: CreateCategoryDto,
        update: UpdateCategoryDto,
    },
}))
@Controller('categories')
export class CategoryManageController extends BaseControllerWithTrash<CategoryService> {
    constructor(protected categoryService: CategoryService) {
        super(categoryService);
    }
}

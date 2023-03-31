import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { createHookOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ListWithTrashedQueryDto } from '@/modules/restful/dtos';

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
            option: createHookOption({
                permissions,
                summary: '分类查询,以分页模式展示',
            }),
        },
        { name: 'detail', option: createHookOption({ permissions, summary: '分类详情' }) },
        { name: 'store', option: createHookOption({ permissions, summary: '添加分类' }) },
        { name: 'update', option: createHookOption({ permissions, summary: '修改分类信息' }) },
        {
            name: 'delete',
            option: createHookOption({ permissions, summary: '删除分类,支持批量删除' }),
        },
        {
            name: 'restore',
            option: createHookOption({ permissions, summary: '恢复回收站中的分类,支持批量恢复' }),
        },
    ],
    dtos: {
        list: ListWithTrashedQueryDto,
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

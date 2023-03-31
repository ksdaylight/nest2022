import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { createHookOption } from '@/modules/rbac/helpers';
import { BaseControllerWithTrash } from '@/modules/restful/base';

import { Crud, Depends } from '@/modules/restful/decorators';

import { Guest } from '@/modules/user/decorators';

import { ContentModule } from '../content.module';
import { QueryCategoryTreeDto } from '../dtos';

import { CategoryService } from '../services';

@ApiTags('分类查询')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'category',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ summary: '分类查询,以分页模式展示', guest: true }),
        },
        { name: 'detail', option: createHookOption({ summary: '分类详情', guest: true }) },
    ],
    dtos: {},
}))
@Controller('categories')
export class CategoryController extends BaseControllerWithTrash<CategoryService> {
    constructor(protected service: CategoryService) {
        super(service);
    }

    @Get('tree')
    @ApiOperation({ summary: '树形结构分类查询' })
    @Guest()
    @SerializeOptions({ groups: ['category-tree'] })
    async tree(@Query() options: QueryCategoryTreeDto) {
        return this.service.findTrees(options);
    }
}

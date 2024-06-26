import { Body, Controller, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { isNil } from 'lodash';

import { PermissionAction } from '@/modules/rbac/constants';
import { Permission } from '@/modules/rbac/decorators/permission.decorator';

import { createHookOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseControllerWithTrash } from '@/modules/restful/base';

import { Crud, Depends } from '@/modules/restful/decorators';
import { ReqUser } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../../content.module';
import { QueryPostDto, ManageUpdatePostDto, ManageCreatePostDto } from '../../dtos';
import { PostEntity } from '../../entities';
import { PostService } from '../../services/post.service';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, PostEntity.name),
];
/**
 * 文章控制器
 */
@ApiTags('文章管理')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async () => {
    return {
        id: 'post',
        enabled: [
            {
                name: 'list',
                option: createHookOption({ permissions, summary: '文章查询,以分页模式展示' }),
            },
            { name: 'detail', option: createHookOption({ permissions, summary: '文章详情' }) },
            { name: 'update', option: createHookOption({ permissions, summary: '修改文章' }) },
            {
                name: 'delete',
                option: createHookOption({ permissions, summary: '删除文章,支持批量删除' }),
            },
            {
                name: 'restore',
                option: createHookOption({
                    permissions,
                    summary: '恢复回收站中的文章,支持批量恢复',
                }),
            },
        ],
        dtos: {
            list: QueryPostDto,
            update: ManageUpdatePostDto,
        },
    };
})
@Controller('posts')
export class PostManageController extends BaseControllerWithTrash<PostService> {
    constructor(protected postService: PostService) {
        super(postService);
    }

    @Post()
    @ApiOperation({ summary: '新增一篇文章' })
    @Permission(async (ab) => ab.can(PermissionAction.MANAGE, PostEntity))
    async store(
        @Body() data: ManageCreatePostDto,
        @ReqUser() user: ClassToPlain<UserEntity>,
    ): Promise<PostEntity> {
        const author = isNil(data.author)
            ? user
            : ({ id: data.author } as ClassToPlain<UserEntity>);
        return this.service.create({ ...data, author: author.id });
    }
}

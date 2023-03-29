import { Controller } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { simpleCrudOption } from '@/modules/rbac/helpers';
import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../content.module';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { PostService } from '../services/post.service';

@ApiTags('文章操作')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'post',
    enabled: [
        {
            name: 'list',
            option: simpleCrudOption('文章查询,以分页模式展示'),
        },
        {
            name: 'detail',
            option: simpleCrudOption('文章详情'),
        },
        {
            name: 'store',
            option: simpleCrudOption('创建文章'),
        },
        {
            name: 'update',
            option: simpleCrudOption('更新文章'),
        },
        {
            name: 'delete',
            option: simpleCrudOption('删除文章8'),
        },
        {
            name: 'restore',
            option: simpleCrudOption('恢复文章'),
        },
    ],
    dtos: {
        store: CreatePostDto,
        update: UpdatePostDto,
        list: QueryPostDto,
    },
}))
@Controller('posts')
export class PostController extends BaseControllerWithTrash<PostService> {
    constructor(protected service: PostService) {
        super(service);
    }
}

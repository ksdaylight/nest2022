import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    SerializeOptions,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { isNil, omit } from 'lodash';
import { In, IsNull, Not } from 'typeorm';

import { SelectTrashMode } from '@/modules/database/constants';
import { QueryHook } from '@/modules/database/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { Permission } from '@/modules/rbac/decorators';
import { checkOwner, createHookOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { Guest, ReqUser } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { PostEntity } from '../entities';
import { PostRepository } from '../repositories';
import { PostService } from '../services/post.service';

const createChecker: PermissionChecker = async (ab) =>
    ab.can(PermissionAction.CREATE, PostEntity.name);

const ownerChecker: PermissionChecker = async (ab, ref, request) =>
    checkOwner(
        ab,
        async (items) =>
            ref.get(PostRepository, { strict: false }).find({
                relations: ['author'],
                where: { id: In(items) },
            }),
        request,
    );

@ApiTags('文章操作')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'post',
    enabled: [
        {
            name: 'delete',
            option: createHookOption({
                permissions: [ownerChecker],
                summary: '删除文章(必须是文章作者),支持批量删除',
            }),
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

    @Get()
    @Guest()
    @ApiOperation({ summary: '查询文章列表,分页展示' })
    @SerializeOptions({ groups: ['post-list'] })
    async list(@Query() options: QueryPostDto, @ReqUser() author: ClassToPlain<UserEntity>) {
        options.trashed = SelectTrashMode.NONE;

        return this.service.paginate(
            omit(options, ['author', 'isPublished']),
            queryListCallback(options, author),
        );
    }

    @Get(':id')
    @Guest()
    @ApiOperation({ summary: '查询文章详情' })
    @SerializeOptions({ groups: ['post-detail'] })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @ReqUser() author: ClassToPlain<UserEntity>,
    ) {
        return this.service.detail(id, queryItemCallback(author));
    }

    @Post()
    @ApiBearerAuth()
    @Permission(createChecker)
    @ApiOperation({ summary: '新增一篇文章' })
    @SerializeOptions({ groups: ['post-store'] })
    async store(
        @Body() data: CreatePostDto,
        @ReqUser() user: ClassToPlain<UserEntity>,
    ): Promise<PostEntity> {
        return this.service.create({ ...data, author: user.id });
    }

    @Patch()
    @ApiBearerAuth()
    @Permission(ownerChecker)
    @ApiOperation({ summary: '修改一篇文章的信息(必须是文章作者)' })
    @SerializeOptions({ groups: ['post-update'] })
    async update(@Body() data: UpdatePostDto) {
        return this.service.update(omit(data, 'author'));
    }
}

const queryPublished = (isPublished?: boolean) => {
    if (typeof isPublished === 'boolean') {
        return isPublished ? { publishedAt: Not(IsNull()) } : { publishedAt: IsNull() };
    }
    return {};
};
/**
 * 在查询列表时,只有自己才能查看自己未发布的文章
 * @param options
 * @param author
 */
const queryListCallback: (
    options: QueryPostDto,
    author: ClassToPlain<UserEntity>,
) => QueryHook<PostEntity> = (options, author) => async (qb) => {
    if (!isNil(author)) {
        if (isNil(options.author)) {
            return qb
                .where({ author: author.id, ...queryPublished(options.isPublished) })
                .orWhere({ publishedAt: Not(IsNull()) });
        }
        return qb.where(
            options.author !== author.id
                ? queryPublished(options.isPublished)
                : { publishedAt: Not(IsNull()) },
        );
    }
    return qb.where({ publishedAt: Not(IsNull()) });
};
/**
 * 在查询文章详情时,只有自己才能查看自己未发布的文章
 * @param author
 */
const queryItemCallback: (author: ClassToPlain<UserEntity>) => QueryHook<PostEntity> =
    (author) => async (qb) => {
        if (!isNil(author)) {
            return qb.andWhere({ 'author.id': author.id }).orWhere({ publishedAt: Not(IsNull()) });
        }
        return qb.andWhere({ publishedAt: Not(IsNull()) });
    };

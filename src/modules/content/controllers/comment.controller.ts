import { Get, Body, Controller, Post, SerializeOptions, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { In } from 'typeorm';

import { PermissionAction } from '@/modules/rbac/constants';
import { Permission } from '@/modules/rbac/decorators/permission.decorator';
import { checkOwner, createHookOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { Guest, ReqUser } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import { CreateCommentDto, QueryCommentDto, QueryCommentTreeDto } from '../dtos';
import { CommentEntity } from '../entities';
import { CommentRepository } from '../repositories';
import { CommentService } from '../services';

const checkers: Record<'create' | 'owner', PermissionChecker> = {
    create: async (ab) => ab.can(PermissionAction.CREATE, CommentEntity.name),
    owner: async (ab, ref, request) =>
        checkOwner(
            ab,
            async (items) =>
                ref.get(CommentRepository, { strict: false }).find({
                    relations: ['user'],
                    where: { id: In(items) },
                }),
            request,
        ),
};
/**
 * 评论控制器
 */
@ApiTags('评论操作')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'comment',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ summary: '评论查询,以分页模式展示', guest: true }),
        },
        {
            name: 'detail',
            option: createHookOption({ summary: '评论详情', guest: true }),
        },
        {
            name: 'delete',
            option: createHookOption({ permissions: [checkers.owner], summary: '删除评论' }),
        },
    ],
    dtos: {
        list: QueryCommentDto,
    },
}))
@Controller('comments')
export class CommentController extends BaseController<CommentService> {
    constructor(protected service: CommentService) {
        super(service);
    }

    @Guest()
    @Get('tree')
    @ApiOperation({ summary: '查询一篇文章的评论,以树形嵌套结构展示' })
    @SerializeOptions({ groups: ['comment-tree'] })
    async tree(
        @Query()
        query: QueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: '评论一篇文章' })
    @Permission(checkers.create)
    async store(
        @Body()
        data: CreateCommentDto,
        @ReqUser() user: ClassToPlain<UserEntity>,
    ) {
        return this.service.create(data, user);
    }
}

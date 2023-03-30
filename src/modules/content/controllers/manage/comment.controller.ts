import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { createHookOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../../content.module';
import { ManageQueryCommentDto } from '../../dtos';
import { CommentEntity } from '../../entities/comment.entity';
import { CommentService } from '../../services';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, CommentEntity.name),
];
/**
 * 评论控制器
 */
@ApiTags('评论管理')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async () => ({
    id: 'comment',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ permissions, summary: '查询评论列表' }),
        },
        {
            name: 'delete',
            option: createHookOption({ permissions, summary: '删除评论,支持批量删除' }),
        },
    ],
    dtos: {
        list: ManageQueryCommentDto,
    },
}))
@Controller('comments')
export class CommentManageController extends BaseController<CommentService> {
    constructor(protected commentService: CommentService) {
        super(commentService);
    }
}

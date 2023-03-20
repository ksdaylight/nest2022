import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { simpleCurdOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';
import { DeleteDto } from '@/modules/restful/dtos';

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
    id: 'commentManage',
    enabled: [
        {
            name: 'list',
            option: simpleCurdOption(permissions, '查询评论列表'),
        },
        { name: 'delete', option: simpleCurdOption(permissions, '删除评论,支持批量删除') },
    ],
    dtos: {
        list: ManageQueryCommentDto,
        delete: DeleteDto,
    },
}))
@Controller('comments')
export class CommentManageController extends BaseController<CommentService> {
    constructor(protected commentService: CommentService) {
        super(commentService);
    }
}

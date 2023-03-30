import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { createHookOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseController } from '@/modules/restful/base';

import { Crud, Depends } from '@/modules/restful/decorators';

import { QueryMessageDto } from '../../dtos';
import { MessageEntity } from '../../entities/message.entity';
import { MessageService } from '../../services';
import { UserModule } from '../../user.module';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, MessageEntity.name),
];
@ApiTags('消息管理')
@ApiBearerAuth()
@Depends(UserModule)
@Crud(() => ({
    id: 'message',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ permissions, summary: '消息查询,以分页模式展示' }),
        },
        { name: 'detail', option: createHookOption({ permissions, summary: '消息详情' }) },
        {
            name: 'delete',
            option: createHookOption({ permissions, summary: '删除消息,支持批量删除' }),
        },
    ],
    dtos: {
        list: QueryMessageDto,
    },
}))
@Controller('messages')
export class MessageManageController extends BaseController<MessageService> {
    constructor(protected messageService: MessageService) {
        super(messageService);
    }
}

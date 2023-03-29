import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { simpleCrudOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';

import { BaseController } from '@/modules/restful/base';
import { Crud } from '@/modules/restful/decorators/crud.decorator';
import { Depends } from '@/modules/restful/decorators/depends.decorator';

import { MediaEntity } from '../entities';
import { MediaModule } from '../media.module';
import { MediaService } from '../services';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, MediaEntity.name),
];

@ApiTags('文件管理')
@ApiBearerAuth()
@Depends(MediaModule)
@Crud(async () => ({
    id: 'media',
    enabled: [
        {
            name: 'list',
            option: simpleCrudOption({ permissions, summary: '文件查询,以分页模式展示' }),
        },
        { name: 'detail', option: simpleCrudOption({ permissions, summary: '文件详情' }) },
        { name: 'delete', option: simpleCrudOption({ permissions, summary: '删除文件,支持批量删除' }) },
    ],
    dtos: {},
}))
@Controller('medias')
export class MediaManageController extends BaseController<MediaService> {
    constructor(protected service: MediaService) {
        super(service);
    }
}

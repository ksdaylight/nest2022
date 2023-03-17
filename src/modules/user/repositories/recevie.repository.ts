import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { MessagerecevieEntity } from '../entities';

@CustomRepository(MessagerecevieEntity)
export class RecevieRepository extends BaseRepository<MessagerecevieEntity> {
    protected _qbName = 'recevie';
}

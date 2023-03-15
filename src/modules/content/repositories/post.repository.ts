import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { CommentEntity, PostEntity } from '../entities';

@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {
    protected _qbName = 'post';

    buildBaseQB() {
        return this.createQueryBuilder(this.qbName)
            .leftJoinAndSelect(`${this.qbName}.categories`, 'categories')
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(c.id)')
                    .from(CommentEntity, 'c')
                    .where('c.post.id = post.id');
            }, 'commentCount')
            .loadRelationCountAndMap(`${this.qbName}.commentCount`, `${this.qbName}.comments`);
    }
}

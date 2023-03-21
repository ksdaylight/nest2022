import { SelectQueryBuilder } from 'typeorm';

import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { CommentEntity, PostEntity } from '../entities';

@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {
    protected _qbName = 'post';

    buildBaseQB(): SelectQueryBuilder<PostEntity> {
        return this.createQueryBuilder(this.qbName)
            .leftJoinAndSelect(`${this.qbName}.categories`, 'categories')
            .leftJoinAndSelect(`${this.qbName}.author`, 'author')
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(c.id)')
                    .from(CommentEntity, 'c')
                    .where(`c.${this.qbName}.id = ${this.qbName}.id`);
            }, 'commentCount')
            .loadRelationCountAndMap(`${this.qbName}.commentCount`, `${this.qbName}.comments`);
    }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { isNil } from 'lodash';
import { EntityNotFoundError, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';
import { UserService } from '@/modules/user/services';

import {
    CreateCommentDto,
    ManageQueryCommentDto,
    QueryCommentDto,
    QueryCommentTreeDto,
} from '../dtos';

import { CommentEntity } from '../entities';
import { CommentRepository, PostRepository } from '../repositories';

@Injectable()
export class CommentService extends BaseService<CommentEntity, CommentRepository> {
    constructor(
        protected repository: CommentRepository,
        protected postRepository: PostRepository,
        protected userService: UserService,
    ) {
        super(repository);
    }

    async findTrees(options: QueryCommentTreeDto = {}) {
        return this.repository.findTrees({
            addQuery: async (qb) => {
                return isNil(options.post) ? qb : qb.where('post.id = :id', { id: options.post });
            },
        });
    }

    async paginate(options: ManageQueryCommentDto | QueryCommentDto) {
        const { post, user } = options as ManageQueryCommentDto;
        const addQuery = async (qb: SelectQueryBuilder<CommentEntity>) => {
            const condition: Record<string, string> = {};
            if (isNil(post)) condition.post = post;
            if (!isNil(user)) condition.user = user;
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        return super.paginate({
            ...options,
            addQuery,
        });
    }

    async create(data: CreateCommentDto, user: ClassToPlain<UserEntity>) {
        const parent = await this.getParent(undefined, data.parent);
        if (!isNil(parent) && parent.post.id !== data.post) {
            throw new ForbiddenException('Parent comment and child comment must belong same post!');
        }
        const item = await this.repository.save({
            ...data,
            parent,
            post: await this.getPost(data.post),
            user: await this.userService.getCurrentUser(user),
        });
        return this.repository.findOneOrFail({ where: { id: item.id } });
    }

    protected async getPost(id: string) {
        return !isNil(id) ? this.postRepository.findOneOrFail({ where: { id } }) : id;
    }

    protected async getParent(current?: string, id?: string) {
        if (current === id) return undefined;
        let parent: CommentEntity | undefined;
        if (id !== undefined) {
            if (id === null) return null;
            parent = await this.repository.findOne({
                relations: ['parent', 'post'],
                where: { id },
            });
            if (!parent) {
                throw new EntityNotFoundError(CommentEntity, `Parent comment ${id} not exists!`);
            }
        }
        return parent;
    }
}

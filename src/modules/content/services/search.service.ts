import { WriteResponseBase } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { instanceToPlain } from 'class-transformer';
import { pick } from 'lodash';

import { PostEntity } from '../entities';
import { PostSearchBody } from '../types';

@Injectable()
export class SearchService {
    index = 'posts';

    constructor(protected esSearvice: ElasticsearchService) {}

    async search(text: string) {
        const { hits } = await this.esSearvice.search<PostEntity>({
            index: this.index,
            query: {
                multi_match: { query: text, fields: ['title', 'body', 'summary', 'categories'] },
            },
        });
        return hits.hits.map((item) => item._source);
    }

    async create(post: PostEntity): Promise<WriteResponseBase> {
        return this.esSearvice.index<PostSearchBody>({
            index: this.index,
            document: {
                ...pick(instanceToPlain(post), ['id', 'title', 'body', 'summary']),
                categories: (post.categories ?? []).join(','),
            },
        });
    }

    async update(post: PostEntity) {
        const newBody: PostSearchBody = {
            ...pick(instanceToPlain(post), ['title', 'body', 'summary']),
            categories: (post.categories ?? []).join(','),
        };
        const script = Object.entries(newBody).reduce(
            (result, [key, value]) => `${result} ctx.source.${key}=>'${value}'`,
            '',
        );
        return this.esSearvice.updateByQuery({
            index: this.index,
            query: { match: { id: post.id } },
            script,
        });
    }

    async remove(postId: string) {
        return this.esSearvice.deleteByQuery({
            index: this.index,
            query: { match: { id: postId } },
        });
    }
}

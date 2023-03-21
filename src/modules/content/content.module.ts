import { ModuleMetadata } from '@nestjs/common';

import { UserService } from '@/modules/user/services';

import { ModuleBuilder } from '../core/decorators';
import { DatabaseModule } from '../database/database.module';
import { addEntities, addSubscribers } from '../database/helpers';
import { RbacModule } from '../rbac/rbac.module';
import { UserModule } from '../user/user.module';

import * as dtos from './dtos';
import * as entities from './entities';
import { ContentRbac } from './rbac';
import * as repositories from './repositories';
import { CategoryRepository, PostRepository } from './repositories';
import * as services from './services';
import { CategoryService } from './services';
import { PostService } from './services/post.service';
import { SearchService } from './services/search.service';
import { PostSubscriber } from './subscribers';
import { SearchType } from './types';

@ModuleBuilder(async (configure) => {
    const searchType = await configure.get<SearchType>('content.searchType', 'against');
    const providers: ModuleMetadata['providers'] = [
        ...Object.values(services),
        ...Object.values(dtos),
        PostSubscriber,
        ContentRbac,
        ...(await addSubscribers(configure, [PostSubscriber])),
        {
            provide: PostService,
            inject: [
                PostRepository,
                CategoryRepository,
                CategoryService,
                UserService,
                { token: SearchService, optional: true },
            ],
            useFactory(
                postRepository: PostRepository,
                categoryRepository: CategoryRepository,
                categoryService: CategoryService,
                userService: UserService,
                searchService?: SearchService,
            ) {
                return new PostService(
                    postRepository,
                    categoryRepository,
                    categoryService,
                    userService,
                    searchService,
                    searchType,
                );
            },
        },
    ];
    if (configure.has('elastic') && searchType === 'elastic') providers.push(SearchService);
    return {
        imports: [
            UserModule,
            RbacModule,
            await addEntities(configure, Object.values(entities)),
            DatabaseModule.forRepository(Object.values(repositories)),
        ],
        providers,
        exports: [
            ...Object.values(services),
            PostService,
            DatabaseModule.forRepository(Object.values(repositories)),
        ],
    };
})
export class ContentModule {}

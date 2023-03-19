import { forwardRef, ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';
import { DatabaseModule } from '../database/database.module';
import { addEntities, addSubscribers } from '../database/helpers';
import { UserModule } from '../user/user.module';

import * as dtos from './dtos';
import * as entities from './entities';
import * as repositories from './repositories';
import * as services from './services';
import * as subscribers from './subscribers';

@ModuleBuilder(async (configure) => {
    const providers: ModuleMetadata['providers'] = [
        ...Object.values(dtos),
        ...(await addSubscribers(configure, Object.values(subscribers))),
        ...Object.values(services),
    ];
    return {
        imports: [
            await addEntities(configure, Object.values(entities)),
            DatabaseModule.forRepository(Object.values(repositories)),
            forwardRef(() => UserModule),
        ],
        providers,
        exports: [
            ...Object.values(services),
            DatabaseModule.forRepository(Object.values(repositories)),
        ],
    };
})
export class MediaModule {}

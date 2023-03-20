import { forwardRef, ModuleMetadata } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ModuleBuilder } from '../core/decorators';
import { DatabaseModule } from '../database/database.module';
import { addEntities, addSubscribers } from '../database/helpers';

import { MediaModule } from '../media/media.module';
import { RbacModule } from '../rbac/rbac.module';

import * as dtos from './dtos';
import * as entities from './entities';
import { getWSProviders } from './getways';
import * as guards from './guards';
import { getUserQueue } from './queue';
import { UserRbac } from './rbac';
import * as repositories from './repositories';
import * as services from './services';
import * as strategies from './strategies';
import * as subscribers from './subscribers';

@ModuleBuilder(async (configure) => {
    const queue = await getUserQueue(configure);
    const providers: ModuleMetadata['providers'] = [
        ...(await addSubscribers(configure, Object.values(subscribers))),
        ...Object.values(dtos),
        ...Object.values(guards),
        ...Object.values(services),
        UserRbac,
        ...queue.providers,
        ...(await getWSProviders(configure)),
        ...Object.values(strategies),
    ];
    return {
        imports: [
            await addEntities(configure, Object.values(entities)),
            DatabaseModule.forRepository(Object.values(repositories)),
            PassportModule,
            services.AuthService.jwtModuleFactory(),
            forwardRef(() => RbacModule),
            forwardRef(() => MediaModule),
            ...queue.imports,
        ],
        providers,
        exports: [
            ...queue.providers,
            ...Object.values(services),
            DatabaseModule.forRepository(Object.values(repositories)),
        ],
    };
})
export class UserModule {}

import { ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';

import { RedisService } from './services';
import { RedisOption } from './types';

@ModuleBuilder(async (configure) => {
    const providers: ModuleMetadata['providers'] = [
        {
            provide: RedisService,
            useFactory: async () => {
                const service = new RedisService(await configure.get<RedisOption[]>('redis'));
                service.createClients();
                return service;
            },
        },
    ];
    return {
        global: true,
        providers,
        exports: [RedisService],
    };
})
export class RedisModule {}

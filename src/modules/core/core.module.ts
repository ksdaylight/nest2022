import { Configure } from './configure';

import { ModuleBuilder } from './decorators';

@ModuleBuilder(async (configure) => ({
    global: true,
    providers: [
        {
            provide: Configure,
            useValue: configure,
        },
    ],
    exports: [Configure],
}))
export class CoreModule {}

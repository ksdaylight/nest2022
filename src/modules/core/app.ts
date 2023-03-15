import { exit } from 'process';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { useContainer } from 'class-validator';

import { isNil } from 'lodash';

import { Restful } from '../restful/restful';
import { ApiConfig } from '../restful/types';

import { Configure } from './configure';
import { createBootModule, panic } from './helpers';
import { ConfigStorageOption, CreateOptions, CreatorData } from './types';

export class App {
    protected static _configure: Configure;

    protected static _app: NestFastifyApplication;

    static get configure() {
        return this._configure;
    }

    static get app() {
        return this._app;
    }

    static async buildConfigure(configs: Record<string, any>, option?: ConfigStorageOption) {
        const configure = new Configure();
        configure.init(option);
        for (const key in configs) {
            configure.add(key, configs[key]);
        }
        await configure.sync();
        let appUrl = await configure.get('app.url', undefined);
        if (isNil(appUrl)) {
            const host = await configure.get<string>('app.host');
            const port = await configure.get<number>('app.port')!;
            const https = await configure.get<boolean>('app.https');
            appUrl =
                (await configure.get<boolean>('app.url', undefined)) ??
                `${https ? 'https' : 'http'}://${host!}:${port}`;

            configure.set('app.url', appUrl);
        }
        const routePrefix = await configure.get('api.prefix.route', undefined);
        const apiUrl = routePrefix
            ? `${appUrl}${routePrefix.length > 0 ? `/${routePrefix}` : routePrefix}`
            : appUrl;
        configure.set('app.api', apiUrl);
        return configure;
    }

    static async create(options: CreateOptions): Promise<CreatorData> {
        const { builder, configs, configure, commands = [] } = options;
        let modules = {};
        try {
            this._configure = await this.buildConfigure(configs, configure);
            const { BootModule, modules: maps } = await createBootModule(
                { configure: this._configure },
                options,
            );
            modules = maps;
            this._app = await builder({
                configure: this._configure,
                BootModule,
            });
            if (!isNil(await this._configure.get<ApiConfig>('api', null))) {
                const restful = this._app.get(Restful);
                restful.factoryDocs(this._app);
            }

            this._app.enableShutdownHooks();
            useContainer(this._app.select(BootModule), {
                fallbackOnErrors: true,
            });
            if (this._app.getHttpAdapter() instanceof FastifyAdapter) {
                await this._app.init();
            }
        } catch (error) {
            panic({ message: 'Database config not exists or not right!' });

            exit(0);
        }
        return { configure: this._configure, app: this._app, modules, commands };
    }
}
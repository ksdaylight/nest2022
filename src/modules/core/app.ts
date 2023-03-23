import { exit } from 'process';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { WsAdapter } from '@nestjs/platform-ws';
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
            // 是否启用websockets服务
            if (await this._configure.get<boolean>('app.websockets')) {
                this._app.useWebSocketAdapter(new WsAdapter(this._app));
            }

            if (this._app.getHttpAdapter() instanceof FastifyAdapter) {
                // 启用文件上传服务
                // eslint-disable-next-line global-require
                this._app.register(require('@fastify/multipart'), {
                    attachFieldsToBody: true,
                });
                const fastifyInstance = this._app.getHttpAdapter().getInstance();
                fastifyInstance.addHook(
                    'onRequest',
                    (request: any, reply: any, done: (...args: any[]) => any) => {
                        // eslint-disable-next-line func-names
                        reply.setHeader = function (key: string, value: any) {
                            return this.raw.setHeader(key, value);
                        };
                        // eslint-disable-next-line func-names
                        reply.end = function () {
                            this.raw.end();
                        };
                        request.res = reply;
                        done();
                    },
                );
            }
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
            panic({ message: 'Create app failed!', error });
            exit(0);
        }
        return { configure: this._configure, app: this._app, modules, commands };
    }
}

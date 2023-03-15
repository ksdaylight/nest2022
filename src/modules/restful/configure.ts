import { Type } from '@nestjs/common';
import { Routes } from '@nestjs/core';
import { get, pick } from 'lodash';

import { Configure } from '../core/configure';

import { createRouteModuleTree, genRoutePath, getCleanRoutes } from './helpers';

import { ApiConfig, ApiRouteOption } from './types';

export abstract class RouterConfigure {
    constructor(protected configure: Configure) {}

    protected config!: ApiConfig;

    protected _routes: Routes = [];

    protected _default!: string;

    protected _versions: string[] = [];

    protected _modules: { [key: string]: Type<any> } = {}; // todo ??????

    get routes() {
        return this._routes;
    }

    get default() {
        return this._default;
    }

    get versions() {
        return this._versions;
    }

    get modules() {
        return this._modules;
    }

    getConfig<T>(key?: string, defaultValue?: any): T {
        return key ? get(this.config, key, defaultValue) : this.config;
    }
    abstract create(_config: ApiConfig): void;

    protected createConfig(config: ApiConfig) {
        if (!config.default) {
            throw new Error('default api version name should been config!');
        }
        const versionMaps = Object.entries(config.versions)
            .filter(([name]) => {
                if (config.default === name) return true;
                return config.enabled.includes(name);
            })
            .map(([name, version]) => [
                name,
                {
                    ...pick(config, ['title', 'description', 'auth']),
                    ...version,
                    tags: Array.from(new Set([...(config.tags ?? []), ...(version.tags ?? [])])),
                    routes: getCleanRoutes(version.routes ?? []),
                },
            ]);
        config.versions = Object.fromEntries(versionMaps);
        this._versions = Object.keys(config.versions);
        this._default = config.default;
        if (!this._versions.includes(this._default)) {
            throw new Error(`Default api version named ${this._default} does not exists!`);
        }
        this.config = config;
    }

    protected async createRoutes() {
        const versionMaps = Object.entries(this.config.versions);
        this._routes = (
            await Promise.all(
                versionMaps.map(async ([name, version]) =>
                    (
                        await createRouteModuleTree(
                            this.configure,
                            this._modules,
                            version.routes ?? [],
                            name,
                        )
                    ).map((route) => ({
                        ...route,
                        path: genRoutePath(route.path, this.config.prefix?.route, name),
                    })),
                ),
            )
        ).reduce((o, n) => [...o, ...n], []);
        const defaultVersion = this.config.versions[this._default];
        this._routes = [
            ...this._routes,
            ...(
                await createRouteModuleTree(
                    this.configure,
                    this._modules,
                    defaultVersion.routes ?? [],
                )
            ).map((route) => ({
                ...route,
                path: genRoutePath(route.path, this.config.prefix?.route),
            })),
        ];
    }

    protected getRouteModules(routes: ApiRouteOption[], parent?: string) {
        const result = routes
            .map(({ name, children }) => {
                const routeName = parent ? `${parent}.${name}` : name;
                let modules: Type<any>[] = [this._modules[routeName]];
                if (children) modules = [...modules, ...this.getRouteModules(children, routeName)];
                return modules;
            })
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);
        return result;
    }
}

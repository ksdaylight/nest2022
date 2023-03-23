import { INestApplication, Injectable, Type } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { omit, trim } from 'lodash';

import { RouterConfigure } from './configure';
import { genDocPath } from './helpers';
import {
    ApiConfig,
    ApiDocOption,
    ApiDocSource,
    ApiRouteOption,
    ApiSwaggerOption,
    ApiVersionOption,
} from './types';

@Injectable()
export class Restful extends RouterConfigure {
    protected _docs!: {
        [version: string]: ApiDocOption;
    };

    protected excludeVersionModules: string[] = [];

    get docs() {
        return this._docs;
    }

    getModuleImports() {
        return [...Object.values(this.modules), RouterModule.register(this.routes)];
    }

    protected getRouteDocs(
        option: Omit<ApiSwaggerOption, 'include'>,
        routes: ApiRouteOption[],
        parent?: string,
    ): { [key: string]: ApiSwaggerOption } {
        const mergeDoc = (vDoc: Omit<ApiSwaggerOption, 'include'>, route: ApiRouteOption) => ({
            ...vDoc,
            ...route.doc,
            tags: Array.from(new Set([...(vDoc.tags ?? []), ...(route.doc?.tags ?? [])])),
            path: genDocPath(route.path, this.config.prefix.doc, parent),
            include: this.getRouteModules([route], parent),
        });
        let routeDocs: { [key: string]: ApiSwaggerOption } = {};
        const hasAdditional = (doc?: ApiDocSource) =>
            doc && Object.keys(omit(doc, 'tags')).length > 0;

        for (const route of routes) {
            const { name, doc, children } = route;
            const moduleName = parent ? `${parent}.${name}` : name;

            if (hasAdditional(doc) || parent) this.excludeVersionModules.push(moduleName);
            if (hasAdditional(doc)) {
                routeDocs[moduleName.replace(`${option.version}.`, '')] = mergeDoc(option, route);
            }
            if (children) {
                routeDocs = {
                    ...routeDocs,
                    ...this.getRouteDocs(option, children, moduleName),
                };
            }
        }
        return routeDocs;
    }

    protected filterExcludeModules(routeModules: Type<any>[]) {
        const excludeModules: Type<any>[] = [];
        const excludeNames = Array.from(new Set(this.excludeVersionModules));
        for (const [name, module] of Object.entries(this._modules)) {
            if (excludeNames.includes(name)) excludeModules.push(module);
        }
        return routeModules.filter(
            (rmodule) => !excludeModules.find((emodule) => emodule === rmodule),
        );
    }

    protected getDocOption(name: string, voption: ApiVersionOption, isDefault = false) {
        const docConfig: ApiDocOption = {};

        const defaultDoc = {
            title: voption.title!,
            description: voption.description!,
            tags: voption.tags ?? [],
            auth: voption.auth ?? false,
            version: name,
            path: trim(`${this.config.prefix?.doc}${isDefault ? '' : `/${name}`}`, '/'),
        };

        const routesDoc = isDefault
            ? this.getRouteDocs(defaultDoc, voption.routes ?? [])
            : this.getRouteDocs(defaultDoc, voption.routes ?? [], name);
        if (Object.keys(routesDoc).length > 0) {
            docConfig.routes = routesDoc;
        }
        const routeModules = isDefault
            ? this.getRouteModules(voption.routes ?? [])
            : this.getRouteModules(voption.routes ?? [], name);
        const include = this.filterExcludeModules(routeModules);
        if (include.length > 0 || !docConfig.routes) {
            docConfig.default = { ...defaultDoc, include };
        }
        return docConfig;
    }

    protected createDocs() {
        const versionMaps = Object.entries(this.config.versions);
        const vDocs = versionMaps.map(([name, version]) => [
            name,
            this.getDocOption(name, version),
        ]);
        this._docs = Object.fromEntries(vDocs);
        const defaultVersion = this.config.versions[this._default];
        this._docs.default = this.getDocOption(this._default, defaultVersion, true);
    }

    async create(config: ApiConfig) {
        this.createConfig(config);
        await this.createRoutes();
        this.createDocs();
    }

    // - for app
    factoryDocs<T extends INestApplication>(app: T) {
        const docs = Object.values(this._docs)
            .map((vdoc) => [vdoc.default, ...Object.values(vdoc.routes ?? {})])
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);

        for (const voption of docs) {
            const { title, description, version, auth, include, tags } = voption!;
            const builder = new DocumentBuilder();
            if (title) builder.setTitle(title);
            if (description) builder.setDescription(description);
            if (auth) builder.addBearerAuth();
            if (tags) {
                tags.forEach((tag) =>
                    typeof tag === 'string'
                        ? builder.addTag(tag)
                        : builder.addTag(tag.name, tag.description, tag.externalDocs),
                );
            }
            builder.setVersion(version);
            const document = SwaggerModule.createDocument(app, builder.build(), {
                include: include.length > 0 ? include : [() => undefined as any],
            });
            SwaggerModule.setup(voption!.path, app, document);
        }
    }
}

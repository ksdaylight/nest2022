import { Type } from '@nestjs/common';
import { Routes, RouteTree } from '@nestjs/core';
import { ApiTags } from '@nestjs/swagger';
import chalk from 'chalk';
import { camelCase, isFunction, isNil, omit, trim, upperFirst } from 'lodash';

import { Configure } from '../core/configure';
import { CreateModule, isAsyncFn } from '../core/helpers';

import { CONTROLLER_DEPENDS, CRUD_OPTIONS_REGISTER } from './constants';
import { registerCrud } from './crud';
import { Restful } from './restful';

import { ApiDocOption, ApiRouteOption } from './types';

export const trimPath = (routePath: string, addPrefix = true) =>
    `${addPrefix ? '/' : ''}${trim(routePath.replace('//', '/'), '/')}`;

export const getCleanRoutes = (data: ApiRouteOption[]): ApiRouteOption[] =>
    data.map((option) => {
        const route: ApiRouteOption = {
            ...omit(option, 'children'),
            path: trimPath(option.path),
        };
        if (option.children && option.children.length > 0) {
            route.children = getCleanRoutes(option.children);
        } else {
            delete route.children;
        }
        return route;
    });
export const createRouteModuleTree = async (
    configure: Configure,
    modules: { [key: string]: Type<any> },
    routes: ApiRouteOption[],
    parentModule?: string,
): Promise<Routes> => {
    const resultRoutes: RouteTree[] = [];

    for (const { name, path, children, controllers, doc } of routes) {
        const moduleName = parentModule ? `${parentModule}.${name}` : name;
        if (Object.keys(modules).includes(moduleName)) {
            throw new Error('route name should be unique in same level!');
        }

        const depends = controllers
            .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [])
            .reduce((o: Type<any>[], n) => {
                if (o.find((i) => i === n)) return o;
                return [...o, ...n];
            }, []);

        // console.log('-->routes in use:\n');
        // console.dir({ name, path, children, controllers, doc });
        for (const controller of controllers) {
            // console.log('-->controller:\n');
            // console.dir(controller);
            const crudRegister = Reflect.getMetadata(CRUD_OPTIONS_REGISTER, controller);
            if (!isNil(crudRegister) && isFunction(crudRegister)) {
                // console.log('-------------->ok start :');
                // console.dir(controller);
                const CrudOptions = isAsyncFn(crudRegister)
                    ? await crudRegister(configure)
                    : crudRegister(configure);
                await registerCrud(controller, CrudOptions);
                // console.log('-------------->registerCrud:');
                // console.dir(controller);
            }
        }
        if (doc?.tags && doc.tags.length > 0) {
            controllers.forEach((controller) => {
                !Reflect.getMetadata('swagger/apiUseTags', controller) &&
                    ApiTags(...doc.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))!)(
                        controller,
                    );
            });
        }
        const module = CreateModule(`${upperFirst(camelCase(name))}RouteModule`, () => ({
            controllers,
            imports: depends,
        }));
        modules[moduleName] = module;
        const route: RouteTree = { path, module };
        // console.log('-->modules:\n');
        // console.dir(modules);

        if (children) {
            route.children = await createRouteModuleTree(configure, modules, children, moduleName);
        }
        resultRoutes.push(route);
    }
    // 在循环之外返回结果路由对象
    return resultRoutes;
};
// export const createRouteModuleTree = (
//     configure: Configure,
//     modules: { [key: string]: Type<any> },
//     routes: ApiRouteOption[],
//     parentModule?: string,
// ): Promise<Routes> =>
//     Promise.all(
//         routes.map(async ({ name, path, children, controllers, doc }) => {
//             const moduleName = parentModule ? `${parentModule}.${name}` : name;
//             if (Object.keys(modules).includes(moduleName)) {
//                 throw new Error('route name should be unique in same level!');
//             }
//             const depends = controllers
//                 .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [])
//                 .reduce((o: Type<any>[], n) => {
//                     if (o.find((i) => i === n)) return o;
//                     return [...o, ...n];
//                 }, []);
//             for (const controller of controllers) {
//                 const crudRegister = Reflect.getMetadata(CRUD_OPTIONS_REGISTER, controller);
//                 if (!isNil(crudRegister) && isFunction(crudRegister)) {
//                     const CrudOptions = isAsyncFn(crudRegister)
//                         ? await crudRegister(configure)
//                         : crudRegister(configure);
//                     registerCrud(controller, CrudOptions);
//                 }
//             }
//             if (doc?.tags && doc.tags.length > 0) {
//                 controllers.forEach((controller) => {
//                     !Reflect.getMetadata('swagger/apiUseTags', controller) &&
//                         ApiTags(
//                             ...doc.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))!,
//                         )(controller);
//                 });
//             }
//             const module = CreateModule(`${upperFirst(camelCase(name))}RouteModule`, () => ({
//                 controllers,
//                 imports: depends,
//             }));
//             modules[moduleName] = module;
//             const route: RouteTree = { path, module };
//             if (children)
//                 route.children = await createRouteModuleTree(
//                     configure,
//                     modules,
//                     children,
//                     moduleName,
//                 );
//             return route;
//         }),
//     );
/**
 * 生成最终路由路径(为路由路径添加自定义及版本前缀)
 * @param routePath
 * @param prefix
 * @param version
 */
export const genRoutePath = (routePath: string, prefix?: string, version?: string) =>
    trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`);

/**
 * 生成最终文档路径
 * @param routePath
 * @param prefix
 * @param version
 */
export const genDocPath = (routePath: string, prefix?: string, version?: string) =>
    trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`, false);

// print api

function echoDocs(name: string, doc: ApiDocOption, appUrl: string) {
    const getDocPath = (dpath: string) => `${appUrl}/${dpath}`;
    if (!doc.routes && doc.default) {
        console.log(
            `    [${chalk.blue(name.toUpperCase())}]: ${chalk.green.underline(
                getDocPath(doc.default.path),
            )}`,
        );
        return;
    }
    console.log(`    [${chalk.blue(name.toUpperCase())}]:`);
    if (doc.default) {
        console.log(`      default: ${chalk.green.underline(getDocPath(doc.default.path))}`);
    }
    if (doc.routes) {
        Object.entries(doc.routes).forEach(([_routeName, rdocs]) => {
            console.log(
                `      <${chalk.yellowBright.bold(rdocs.title)}>: ${chalk.green.underline(
                    getDocPath(rdocs.path),
                )}`,
            );
        });
    }
}
export async function echoApi(configure: Configure, restful: Restful) {
    const appUrl = await configure.get<string>('app.url');
    const apiUrl = await configure.get<string>('app.api');
    console.log(`- ApiUrl: ${chalk.green.underline(apiUrl)}`);
    console.log('- ApiDocs:');
    const { default: defaultDoc, ...docs } = restful.docs;
    echoDocs('default', defaultDoc, appUrl);
    for (const [name, doc] of Object.entries(docs)) {
        console.log();
        echoDocs(name, doc, appUrl);
    }
}

// export function createHookOption(summary?: string): CrudMethodOption {
//     return {
//         hook: (target, method) => {
//             if (!isNil(summary))
//                 ApiOperation({ summary })(
//                     target,
//                     method,
//                     Object.getOwnPropertyDescriptor(target.prototype, method),
//                 );
//         },
//     };
// }

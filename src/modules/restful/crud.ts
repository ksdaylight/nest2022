// import util from 'util';

import { Delete, Get, Patch, Post, SerializeOptions, Type } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { ClassTransformOptions } from 'class-transformer';
import { isNil } from 'lodash';

import { BaseController, BaseControllerWithTrash } from './base';
import { ALLOW_GUEST } from './constants';

import { CrudItem, CrudOptions } from './types';

export const registerCrud = async <T extends BaseController<any>>(
    Target: Type<T>,
    options: CrudOptions,
) => {
    const { id, enabled, dtos } = options;
    const methods: CrudItem[] = [];

    for (const value of enabled) {
        const item = (typeof value === 'string' ? { name: value } : value) as CrudItem;
        if (
            methods.map(({ name }) => name).includes(item.name) ||
            !isNil(Object.getOwnPropertyDescriptor(Target.prototype, item.name))
        )
            continue;
        methods.push(item);
    }
    // console.log('\n');
    // console.dir(options);
    for (const { name, option = {} } of methods) {
        if (isNil(Object.getOwnPropertyDescriptor(Target.prototype, name))) {
            const descriptor =
                Target instanceof BaseControllerWithTrash
                    ? Object.getOwnPropertyDescriptor(BaseControllerWithTrash.prototype, name)
                    : Object.getOwnPropertyDescriptor(BaseController.prototype, name);

            Object.defineProperty(Target.prototype, name, {
                ...descriptor,
                async value(...args: any[]) {
                    return descriptor.value.apply(this, args);
                },
            });
        }
        // const baseDescriptor =
        //     Target instanceof BaseControllerWithTrash
        //         ? Object.getOwnPropertyDescriptor(BaseControllerWithTrash.prototype, name)
        //         : Object.getOwnPropertyDescriptor(BaseController.prototype, name);

        // if (!isNil(baseDescriptor)) {
        //     let descriptor = Object.getOwnPropertyDescriptor(Target.prototype, name);
        //     descriptor = isNil(descriptor) ? baseDescriptor : descriptor;
        //     Object.defineProperty(Target.prototype, name, {
        //         ...descriptor,
        //         async value(...args: any[]) {
        //             return descriptor.value.apply(this, args);
        //         },
        //     });
        // }

        const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, name);
        // console.log(`\n start ${name} of:`);
        // console.log(util.inspect(Target, { showHidden: true, depth: null }));
        // eslint-disable-next-line @typescript-eslint/naming-convention, unused-imports/no-unused-vars
        const [_, ...params] = Reflect.getMetadata('design:paramtypes', Target.prototype, name);

        if (name === 'store' && !isNil(dtos.store)) {
            Reflect.defineMetadata(
                'design:paramtypes',
                [dtos.store, ...params],
                Target.prototype,
                name,
            );
            ApiBody({ type: dtos.store })(Target, name, descriptor);
        } else if (name === 'update' && !isNil(dtos.update)) {
            Reflect.defineMetadata(
                'design:paramtypes',
                [dtos.update, ...params],
                Target.prototype,
                name,
            );
            ApiBody({ type: dtos.update })(Target, name, descriptor);
        } else if (name === 'list' && !isNil(dtos.list)) {
            Reflect.defineMetadata(
                'design:paramtypes',
                [dtos.list, ...params],
                Target.prototype,
                name,
            );
            ApiQuery({ type: dtos.list })(Target, name, descriptor);
        }
        if (option.allowGuest) {
            Reflect.defineMetadata(ALLOW_GUEST, true, Target.prototype, name);
        }

        let serialize: ClassTransformOptions = {};
        if (isNil(option.serialize)) {
            if (['detail', 'store', 'update', 'delete', 'restore'].includes(name)) {
                serialize = { groups: [`${id}-detail`] };
            } else if (['list'].includes(name)) {
                serialize = { groups: [`${id}-list`] };
            }
        } else if (option.serialize === 'noGroup') {
            serialize = {};
        } else {
            serialize = option.serialize;
        }
        SerializeOptions(serialize)(Target, name, descriptor);

        switch (name) {
            case 'list':
                Get()(Target, name, descriptor);
                break;
            case 'detail':
                Get(':id')(Target, name, descriptor);
                break;
            case 'store':
                Post()(Target, name, descriptor);
                break;
            case 'update':
                Patch()(Target, name, descriptor);
                break;
            case 'delete':
                Delete()(Target, name, descriptor);
                break;
            default:
                break;
        }

        if (!isNil(option.hook)) option.hook(Target, name);
        // console.log(`\nFinish -> ${name} `);
    }
};

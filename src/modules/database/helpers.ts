import { resolve } from 'path';

import { Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { isNil } from 'lodash';
import { DataSource, ObjectLiteral, ObjectType, Repository, SelectQueryBuilder } from 'typeorm';

import { Configure } from '../core/configure';
import { deepMerge } from '../core/helpers';
import { createConnectionOptions } from '../core/helpers/options';

import { ConfigureFactory, ConfigureRegister } from '../core/types';

import { CUSTOM_REPOSITORY_METADATA } from './constants';

import {
    DbConfig,
    DbConfigOptions,
    OrderQueryType,
    PaginateOptions,
    PaginateReturn,
    TypeormOption,
} from './types';

export const getOrderByQuery = <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    alias: string,
    orderBy?: OrderQueryType,
) => {
    if (isNil(orderBy)) return qb;
    if (typeof orderBy === 'string') return qb.orderBy(`${alias}.${orderBy}`, 'DESC');
    if (Array.isArray(orderBy)) {
        orderBy.forEach((item, i) => {
            const orderByClause =
                typeof item === 'string' ? `${alias}.${item}` : `${alias}.${item.name}`;
            const order = typeof item === 'string' ? 'DESC' : item.order;
            if (i === 0) {
                qb.orderBy(orderByClause, order);
            } else {
                qb.addOrderBy(orderByClause, order);
            }
        });
        return qb;
    }
    return qb.orderBy(`${alias}.${(orderBy as any).name}`, (orderBy as any).order);
};

/**
 * 分页函数
 * @param qb queryBuilder实例
 * @param options 分页选项
 */
export const paginate = async <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    options: PaginateOptions,
): Promise<PaginateReturn<E>> => {
    const start = options.page > 0 ? options.page - 1 : 0;
    const totalItems = await qb.getCount();
    qb.take(options.limit).skip(start * options.limit);
    const items = await qb.getMany();
    const totalPages = Math.ceil(totalItems / options.limit);
    const itemCount =
        // eslint-disable-next-line no-nested-ternary
        options.page < totalPages ? options.limit : options.page === totalPages ? totalItems : 0;
    return {
        items,
        meta: {
            totalItems,
            itemCount,
            perPage: options.limit,
            totalPages,
            currentPage: options.page,
        },
    };
};

/**
 * 数据手动分页函数
 * @param options 分页选项
 * @param data 数据列表
 */
export function manualPaginate<E extends ObjectLiteral>(
    options: PaginateOptions,
    data: E[],
): PaginateReturn<E> {
    const { page, limit } = options;
    let items: E[] = [];
    const totalItems = data.length;
    const totalRst = totalItems / limit;
    const totalPages =
        totalRst > Math.floor(totalRst) ? Math.floor(totalRst) + 1 : Math.floor(totalRst);
    let itemCount = 0;
    if (page <= totalPages) {
        itemCount = page === totalPages ? totalItems - (totalPages - 1) * limit : limit;
        const start = (page - 1) * limit;
        items = data.slice(start, start + itemCount);
    }
    return {
        meta: {
            itemCount,
            totalItems,
            perPage: limit,
            totalPages,
            currentPage: page,
        },
        items,
    };
}
export const getCustomRepository = <T extends Repository<E>, E extends ObjectLiteral>(
    dataSource: DataSource,
    Repo: ClassType<T>,
): T => {
    if (isNil(Repo)) return null;
    const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);
    if (!entity) return null;
    const base = dataSource.getRepository<ObjectType<any>>(entity);
    return new Repo(base.target, base.manager, base.queryRunner) as T;
};

// ---config:

export const createDbConfig: (
    register: ConfigureRegister<RePartial<DbConfigOptions>>,
) => ConfigureFactory<DbConfigOptions, DbConfig> = (register) => ({
    register,
    hook: (configure, value) => createDbOptions(configure, value),
    defaultRegister: () => ({
        common: {
            sharset: 'utf8mb4',
            logging: ['error'],
        },
        connections: [],
    }),
    append: false,
    Storage: false,
});

export const createDbOptions = (configure: Configure, options: DbConfigOptions) => {
    const newOptions: DbConfigOptions = {
        common: deepMerge(
            {
                charset: 'utf8mb4',
                logging: ['error'],
                migrations: [],
                paths: {
                    migration: resolve(__dirname, '../../database/migrations'),
                },
            },
            options.common ?? {},
            'replace',
        ),
        connections: createConnectionOptions(options.connections ?? []),
    };
    newOptions.connections = newOptions.connections.map((connection) => {
        const entities = connection.entities ?? [];
        const newOption = { ...connection, entities };
        return deepMerge(
            newOptions.common,
            {
                ...newOption,
                synchronize: false,
                autoLoadEntities: true,
            } as any,
            'replace',
        );
    });
    return newOptions as DbConfig;
};

/** ****************************** 类注册及读取 **************************** */
// export const addEntities = async (
//     configure: Configure,
//     entities: EntityClassOrSchema[] = [],
//     dataSource = 'default',
// ) => {
//     const database = await configure.get<DbConfig>('database');
//     if (isNil(database)) throw new Error(`Typeorm have not any config!`);
//     const dbConfig = database.connections.find(({ name }) => name === dataSource);
//     if (isNil(dbConfig)) throw new Error(`Database connection named ${dataSource} not exists!`);
//     const oldEntities = (dbConfig.entities ?? []) as ObjectLiteral[];

//     configure.set(
//         'database.connections',
//         database.connections.map((connection) =>
//             connection.name === dataSource
//                 ? {
//                       ...connection,
//                       entities: [...entities, ...oldEntities],
//                   }
//                 : connection,
//         ),
//     );
//     return TypeOrmModule.forFeature(entities, dataSource);
// };

// export const addSubscribers = async (
//     configure: Configure,
//     subscribers: Type<any>[] = [],
//     dataSource = 'default',
// ) => {
//     const database = await configure.get<DbConfig>('database');
//     if (isNil(database)) throw new Error(`Typeorm have not any config!`);
//     const dbConfig = database.connections.find(({ name }) => name === dataSource);
//     // eslint-disable-next-line prettier/prettier, prefer-template
//     if (isNil(dbConfig)) throw new Error('Database connection named' + dataSource + 'not exists!');

//     const oldSubscribers = (dbConfig.subscribers ?? []) as any[];

//     /**
//      * 更新数据库配置,添加上新的订阅者
//      */
//     configure.set(
//         'database.connections',
//         database.connections.map((connection) =>
//             connection.name === dataSource
//                 ? {
//                       ...connection,
//                       subscribers: [...oldSubscribers, ...subscribers],
//                   }
//                 : connection,
//         ),
//     );
//     return subscribers;
// };
export const updateDbConfig = async (
    configure: Configure,
    dataSource = 'default',
    entities: EntityClassOrSchema[] = [],
    subscribers: Type<any>[] = [],
) => {
    const database = await configure.get<DbConfig>('database');
    if (isNil(database)) {
        throw new Error(`Typeorm have not any config!`);
    }

    const dbConfig = database.connections.find(({ name }) => name === dataSource);
    if (isNil(dbConfig)) {
        throw new Error(`Database connection named ${dataSource} not exists!`);
    }

    const oldEntities = (dbConfig.entities ?? []) as ObjectLiteral[];
    const oldSubscribers = (dbConfig.subscribers ?? []) as any[];

    const updateConnection = (connection: TypeormOption) => {
        if (connection.name === dataSource) {
            return {
                ...connection,
                entities: [...entities, ...oldEntities],
                subscribers: [...oldSubscribers, ...subscribers],
            };
        }
        return connection;
    };

    configure.set('database.connections', database.connections.map(updateConnection));

    return {
        modules: TypeOrmModule.forFeature(entities, dataSource),
        subscribersList: subscribers,
    };
};

export const addEntities = async (
    configure: Configure,
    entities: EntityClassOrSchema[] = [],
    dataSource = 'default',
) => {
    const { modules } = await updateDbConfig(configure, dataSource, entities);

    return modules;
};

export const addSubscribers = async (
    configure: Configure,
    subscribers: Type<any>[] = [],
    dataSource = 'default',
) => {
    const { subscribersList } = await updateDbConfig(configure, dataSource, [], subscribers);

    return subscribersList;
};

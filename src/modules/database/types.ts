import { Faker } from '@faker-js/faker';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Ora } from 'ora';
import {
    DataSource,
    EntityManager,
    EntityTarget,
    FindTreeOptions,
    ManyToMany,
    ManyToOne,
    ObjectLiteral,
    ObjectType,
    OneToMany,
    OneToOne,
    Repository,
    SelectQueryBuilder,
    TreeRepository,
} from 'typeorm';
import yargs from 'yargs';

import { Configure } from '../core/configure';

import { BaseRepository, BaseTreeRepository } from './base';

import { OrderType, SelectTrashMode } from './constants';
import { FactoryResolver } from './resolver';
/** ****************************** 数据查询及操作 **************************** */
/**
 * 动态关联接口
 */
export interface DynamicRelation {
    relation:
        | ReturnType<typeof OneToOne>
        | ReturnType<typeof OneToMany>
        | ReturnType<typeof ManyToOne>
        | ReturnType<typeof ManyToMany>;
    others?: Array<(...args: any) => any>;
    column: string;
}
export interface PaginateOptions {
    page: number;
    limit: number;
}
export interface PaginateReturn<E extends ObjectLiteral> {
    meta: PaginateMeta;
    items: E[];
}
/**
 * 分页原数据
 */
export interface PaginateMeta {
    /**
     * 当前页项目数量
     */
    itemCount: number;
    /**
     * 项目总数量
     */
    totalItems?: number;
    /**
     * 每页显示数量
     */
    perPage: number;
    /**
     * 总页数
     */
    totalPages?: number;
    /**
     * 当前页数
     */
    currentPage: number;
}
export type OrderQueryType =
    | string
    | { name: string; order: `${OrderType}` }
    | Array<{ name: string; order: `${OrderType}` } | string>;

export type QueryHook<Entity> = (
    qb: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

export interface QueryParams<E extends ObjectLiteral> {
    addQuery?: QueryHook<E>;
    orderBy?: OrderQueryType;
    withTrashed?: boolean;
    onlyTrashed?: boolean;
}
export type ServiceListQueryOption<E extends ObjectLiteral> =
    | ServiceListQueryOptionWithTrashed<E>
    | ServiceListQueryOptionNotWIthTrashed<E>;
type ServiceListQueryOptionWithTrashed<E extends ObjectLiteral> = Omit<
    FindTreeOptions & QueryParams<E>,
    'withTrashed'
> & {
    trashed?: `${SelectTrashMode}`;
} & Record<string, any>;
type ServiceListQueryOptionNotWIthTrashed<E extends ObjectLiteral> = Omit<
    ServiceListQueryOptionWithTrashed<E>,
    'trashed'
>;
export type RepositoryType<E extends ObjectLiteral> =
    | Repository<E>
    | TreeRepository<E>
    | BaseTreeRepository<E>
    | BaseRepository<E>;
export interface TrashedOptions {
    trashed?: SelectTrashMode;
}
/** ****************************** 数据库配置 **************************** */

export type DbConfigOptions = {
    common: Record<string, any>;
    connections: Array<TypeOrmModuleOptions>;
};

export type DbConfig = Record<string, any> & {
    common: Record<string, any> & ReRequired<DbAdditionalOption>;
    connections: TypeormOption[];
};

export type TypeormOption = Omit<TypeOrmModuleOptions, 'name' | 'migrations'> & {
    name: string;
} & Required<DbAdditionalOption>;
/**
 * 用于CLI工具
 */
type DbAdditionalOption = {
    /**
     * 填充类
     */
    seedRunner?: SeederConstructor;
    /**
     * 填充类列表
     */
    seeders?: SeederConstructor[];
    /**
     * 数据构建函数列表
     */
    factories?: (() => DbFactoryOption<any, any>)[];
    paths?: {
        /**
         * 迁移文件路径
         */
        migration?: string;
    };
};
/** ****************************** 数据结构迁移 **************************** */
/**
 * 基础数据库命令参数类型
 */
export type TypeOrmArguments = yargs.Arguments<{
    connection?: string;
}>;
/**
 * 生成迁移处理器选项
 */
export interface MigrationGenerateOptions {
    name?: string; // 手动指定迁移文件的类名（即文件名）, 默认: 自动生成
    run?: boolean;
    pretty?: boolean; // 是否打印生成的迁移文件所要执行的SQL，默认：false
    // outputJs?: boolean;
    dryrun?: boolean; // 是否只打印生成的迁移文件的内容而不是直接生成迁移文件，默认: false
    check?: boolean; // 是否只验证数据库是最新的而不是直接生成迁移，默认: false
}
/**
 * 生成迁移命令参数
 */
export type MigrationGenerateArguments = TypeOrmArguments & MigrationGenerateOptions;

/**
 * 运行迁移处理器选项
 */
export interface MigrationRunOptions extends MigrationRevertOptions {
    refresh?: boolean;
    onlydrop?: boolean;
    clear?: boolean;
    seed?: boolean;
}

/**
 * 恢复迁移处理器选项
 */
export interface MigrationRevertOptions {
    transaction?: string;
    fake?: boolean;
}

/**
 * 运行迁移的命令参数
 */
export type MigrationRunArguments = TypeOrmArguments & MigrationRunOptions;

/**
 * 创建迁移处理器选项
 */
export interface MigrationCreateOptions {
    name: string;
    // outputJs?: boolean;
}
/**
 * 创建迁移命令参数
 */
export type MigrationCreateArguments = TypeOrmArguments & MigrationCreateOptions;

/**
 * 恢复迁移的命令参数
 */
export type MigrationRevertArguments = TypeOrmArguments & MigrationRevertOptions;

/** ****************************** 数据填充Seeder **************************** */

/**
 * 数据填充处理器选项
 */
export interface SeederOptions {
    connection?: string;
    transaction?: boolean;
}
/**
 * 数据填充命令参数
 */
export type SeederArguments = TypeOrmArguments & SeederOptions;

/**
 * 数据填充类接口
 */
export interface SeederConstructor {
    new (spinner: Ora, args: SeederOptions): Seeder;
}
/**
 * 数据填充函数映射对象
 */
export type FactoryOptions = {
    [entityName: string]: DbFactoryOption<any, any>;
};
/**
 * 数据填充类的load函数参数
 */
export interface SeederLoadParams {
    /**
     * 数据库连接名称
     */
    connection: string;
    /**
     * 数据库连接池
     */
    dataSource: DataSource;
    /**
     * EntityManager实例
     */
    em: EntityManager;
    /**
     * Factory解析器
     */
    factorier?: DbFactory;
    /**
     * Factory函数列表
     */
    factories: FactoryOptions;
    /**
     * 项目配置类
     */
    configure: Configure;
}
/**
 * 数据填充类方法对象
 */
export interface Seeder {
    load: (params: SeederLoadParams) => Promise<void>;
}

/** ****************************** 数据填充Factory **************************** */
/**
 * Factory解析器
 */
export interface DbFactory {
    <Entity>(entity: EntityTarget<Entity>): <Options>(
        options?: Options,
    ) => FactoryResolver<Entity, Options>;
}

/**
 * Factory处理器
 */
export type DbFactoryHandler<E, O> = (faker: Faker, options: O) => Promise<E>;
/**
 * Factory解析后的元数据
 */
export type DbFactoryOption<E, O> = {
    entity: ObjectType<E>;
    handler: DbFactoryHandler<E, O>;
};
/**
 * Factory自定义参数覆盖
 */
export type FactoryOverride<Entity> = {
    [Property in keyof Entity]?: Entity[Property];
};
/**
 * Factory构造器
 */
export type DbFactoryBuilder = (
    dataSource: DataSource,
    factories: {
        [entityName: string]: DbFactoryOption<any, any>;
    },
) => DbFactory;
/**
 * Factory定义器
 */

export type DefineFactory = <E, O>(
    entity: ObjectType<E>,
    handler: DbFactoryHandler<E, O>,
) => () => DbFactoryOption<E, O>;

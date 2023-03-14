import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
    FindTreeOptions,
    ObjectLiteral,
    Repository,
    SelectQueryBuilder,
    TreeRepository,
} from 'typeorm';
import yargs from 'yargs';

import { BaseRepository, BaseTreeRepository } from './base';

import { OrderType, SelectTrashMode } from './constants';

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
} & ReRequired<DbAdditionalOption>;
/**
 * 用于CLI工具
 */
type DbAdditionalOption = {
    paths?: {
        migration?: string;
    };
};
/** ****************************** 数据结构迁移 **************************** */
/**
 * 基础数据库命令参数类型
 */
export type TypeOrmArguments = yargs.Arguments<{
    connections?: string;
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

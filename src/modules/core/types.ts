/// config system

import { ModuleMetadata, PipeTransform, Type } from '@nestjs/common';
import { IAuthGuard } from '@nestjs/passport';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import dayjs from 'dayjs';
import { Ora } from 'ora';
import { CommandModule } from 'yargs';

import { Configure } from './configure';

export interface ConfigStorageOption {
    storage?: boolean;
    yamlPath?: string;
}

export type ConfigureRegister<T extends Record<string, any>> = (
    configure: Configure,
) => T | Promise<T>;

export interface ConfigureFactory<
    T extends Record<string, any>,
    C extends Record<string, any> = T,
> {
    register: ConfigureRegister<RePartial<T>>;

    defaultRegister?: ConfigureRegister<T>;

    storage?: boolean;

    hook?: (configure: Configure, value: T) => C | Promise<C>;

    append?: boolean;
}

export type ConnectionOption<T extends Record<string, any>> = { name?: string } & T;
export type ConnectionRst<T extends Record<string, any>> = Array<{ name: string } & T>;

// module

export type ModuleOption = { module: Type<any>; params?: Record<string, any> }; // todo ,文档，一些什么？
export type ModuleItem = Type<any> | ModuleOption;
export type ModuleBuilderMeta = ModuleMetadata & { global?: boolean; commands?: CommandCollection };
export type ModuleBuildMap = Record<string, { meta: ModuleBuilderMeta; module: Type<any> }>;
export type ModuleMetaRegister<P extends Record<string, any>> = (
    configure: Configure,
    params: P,
) => ModuleBuilderMeta | Promise<ModuleBuilderMeta>;
// app
export interface AppBuilder {
    (params: { configure: Configure; BootModule: Type<any> }): Promise<NestFastifyApplication>;
}

export type AppParams = {
    configure: Configure;
    app?: NestFastifyApplication;
};

export interface CreatorData extends Required<AppParams> {
    modules: ModuleBuildMap;
    commands: CommandCollection;
}

export interface CreateOptions {
    configs: Record<string, any>;
    builder: AppBuilder;
    globals?: {
        pipe?: (params: AppParams) => PipeTransform<any> | null;
        interceptor?: Type<any> | null;
        filter?: Type<any> | null;
        guard?: Type<IAuthGuard>;
    };
    configure?: ConfigStorageOption;
    modules?: ModuleItem[];
    meta?: (params: AppParams) => ModuleMetadata;
    commands?: CommandCollection;
}
export interface Creator {
    (): Promise<CreatorData>;
}

/**
 * 应用配置
 */
export interface AppConfig {
    /**
     * 主机地址,默认为127.0.0.1
     */
    host: string;
    /**
     * 监听端口,默认3100
     */
    port: number;
    /**
     * 是否开启https,默认false
     */
    https: boolean;
    /**
     * 时区,默认Asia/Shanghai
     */
    timezone: string;
    /**
     * 语言,默认zh-cn
     */
    locale: string;
    /**
     * 是否启用websockets服务
     */
    websockets: boolean;
    /**
     * 是否为服务器运行状态(无法设置,通过指定SERVER环境变量使用,默认false)
     */
    server: boolean;
    /**
     * 控制台打印的url,默认自动生成
     */
    url?: string;
    /**
     * 由url+api前缀生成的基础api url
     */
    api?: string;
}
/**
 源码1：
    server: boolean;

源码2：
const { _ = [] } = yargs(hideBin(process.argv)).argv as any;
        configure.set('app.server', !!(_.length <= 0 || _[0] === 'start'));

源码3：
async onApplicationBootstrap() {
        if (!(await this.configure.get<boolean>('app.server', true))) return null;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();
 ，app.server 是一个应用配置项，用于指示应用是否以服务器模式运行。如果配置项的值为 true，则意味着应用以服务器模式运行，否则意味着应用以瞬时模式运行。在这里，“服务器模式”是指应用一直在运行，例如在生产环境中，而“瞬时模式”是指应用只在执行一些命令时运行，例如在执行数据迁移、数据填充或生成模块类时。

在源码2中，通过解析命令行参数来设置 app.server 的值，如果没有指定命令行参数或者指定的是 start，则将其设置为 true，否则设置为 false。

在源码3中，如果 app.server 的值为 false，则直接返回 null，否则创建一个查询执行器并连接到数据源，如果连接成功则开始一个事务。这表明在执行某些命令时，只有在 app.server 为 true 的情况下才需要连接到数据源并执行事务操作，而在其他情况下则无需执行。

 */

/** ****************************** CLI及命令  ***************************** */

/**
 * 命令集合
 */
export type CommandCollection = Array<CommandItem<any, any>>;

/**
 * 命令构造器
 */
export type CommandItem<T = Record<string, any>, U = Record<string, any>> = (
    params: Required<AppParams>,
) => CommandModule<T, U>;
/**
 * 控制台错误函数panic的选项参数
 */
export interface PanicOption {
    /**
     * 报错消息
     */
    message: string;
    /**
     * ora对象
     */
    spinner?: Ora;
    /**
     * 抛出的异常信息
     */
    error?: any;
    /**
     * 是否退出进程
     */
    exit?: boolean;
}
/** ****************************** 时间  ***************************** */

export interface TimeOptions {
    date?: dayjs.ConfigType;
    format?: dayjs.OptionType;
    locale?: string;
    strict?: boolean;
    zonetime?: string;
}

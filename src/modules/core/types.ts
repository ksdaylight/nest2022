/// config system

import { ModuleMetadata, PipeTransform, Type } from '@nestjs/common';
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
export type ConnectionRst<T extends Record<string, any>> = Array<{ name?: string } & T>;

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
    };
    configure?: ConfigStorageOption;
    modules?: ModuleItem[];
    meta?: (params: AppParams) => ModuleMetadata;
    commands?: CommandCollection;
}
export interface Creator {
    (): Promise<CreatorData>;
}

export interface AppConfig {
    host: string;
    port: number;
    https: boolean;
    timezone: string;
    locale: string;
    url?: string;
    api?: string;
}

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
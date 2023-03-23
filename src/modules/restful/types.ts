import { Type } from '@nestjs/common';
import { ExternalDocumentationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ClassTransformOptions } from 'class-transformer';

import { Configure } from '../core/configure';
/**
 * CRUD控制器方法列表
 */
export type CrudMethod = 'detail' | 'delete' | 'restore' | 'list' | 'store' | 'update';

export interface CrudMethodOption {
    /**
     * 该方法是否允许匿名访问
     */
    allowGuest?: boolean;
    serialize?: ClassTransformOptions | 'noGroup';
    hook?: (target: Type<any>, method: string) => void;
}

export interface CrudItem {
    name: CrudMethod;
    option?: CrudMethodOption;
}

export interface CrudOptions {
    id: string;
    enabled: Array<CrudMethod | CrudItem>;
    dtos: {
        [key in 'list' | 'store' | 'update']?: Type<any>;
    };
}

export type CrudOptionsRegister = (configure: Configure) => CrudOptions | Promise<CrudOptions>;

// api
export interface ApiTagOption {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
}
export interface ApiDocSource {
    title?: string;
    description?: string;
    auth?: boolean;
    tags?: (string | ApiTagOption)[];
}
export interface ApiRouteOption {
    name: string;
    path: string;
    children?: ApiRouteOption[];
    controllers: Type<any>[];
    doc?: ApiDocSource;
}
export interface ApiVersionOption extends ApiDocSource {
    routes?: ApiRouteOption[];
}
export interface ApiConfig extends ApiDocSource {
    prefix?: {
        route?: string;
        doc?: string;
    };
    default: string;
    enabled: string[];
    versions: Record<string, ApiVersionOption>;
}
export interface ApiSwaggerOption extends ApiDocSource {
    version: string;
    path: string;
    include: Type<any>[];
}
export interface ApiDocOption {
    default?: ApiSwaggerOption;
    routes?: { [key: string]: ApiSwaggerOption };
}

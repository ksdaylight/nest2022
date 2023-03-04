import { Type } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';
/**
 * CURD控制器方法列表
 */
export type CrudMethod = 'detail' | 'delete' | 'restore' | 'list' | 'store' | 'update';

export interface CrudMethodOption {
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

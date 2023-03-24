declare type ClassType<T> = { new (...args: any[]): T };
/**
 * 基础类型接口
 */
declare type BaseType = boolean | number | string | undefined | null;

/**
 * 环境变量类型转义函数接口
 */
declare type ParseType<T extends BaseType = string> = (value: string) => T;
/**
 * 类转义为普通对象后的类型
 */
declare type ClassToPlain<T> = { [key in keyof T]: T[key] };
/**
 * 嵌套对象全部可选
 */
declare type RePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] | undefined
        ? RePartial<U>[]
        : T[P] extends object | undefined
        ? T[P] extends ((...args: any[]) => any) | ClassType<T[P]> | undefined
            ? T[P]
            : RePartial<T[P]>
        : T[P];
};

/**
declare type RePartial<T> = {
    [P in keyof T]?: 
        if (T[P] extends (infer U)[] | undefined) {
            RePartial<U>[]
        } else if (T[P] extends object | undefined) {
            if (T[P] extends ((...args: any[]) => any) | ClassType<T[P]> | undefined) {
                T[P]
            } else {
                RePartial<T[P]>
            }
        } else {
            T[P]
        };
};

*/

/**
 * 嵌套对象全部必选
 */
declare type ReRequired<T> = {
    [P in keyof T]-?: T[P] extends (infer U)[] | undefined
        ? ReRequired<U>[]
        : T[P] extends object | undefined
        ? T[P] extends ((...args: any[]) => any) | ClassType<T[P]> | undefined
            ? T[P]
            : ReRequired<T[P]>
        : T[P];
};

/**
 * 空对象
 */
declare type RecordNever = Record<never, never>;
/**
 * 嵌套对象
 */
declare type NestedRecord = Record<string, Record<string, any>>;

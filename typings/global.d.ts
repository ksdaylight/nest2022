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

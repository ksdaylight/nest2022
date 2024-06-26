export enum OrderType {
    ASC = 'ASC',
    DESC = 'DESC',
}
export enum TreeChildrenResolve {
    DELETE = 'delete',
    UP = 'up',
    ROOT = 'root',
}

export enum SelectTrashMode {
    ALL = 'all',
    ONLY = 'only',
    NONE = 'none',
}
/**
 * @description 传入CustomRepository装饰器的metadata数据标识
 */
export const CUSTOM_REPOSITORY_METADATA = 'CUSTOM_REPOSITORY_METADATA';
/**
 * 动态关联元数据
 */
export const ADDTIONAL_RELATIONS = 'additional_relations';

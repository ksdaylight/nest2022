import bcrypt from 'bcrypt';
import { isNil } from 'lodash';

import { App } from '../core/app';

/**
 * 获取user模块配置的值
 * @param key
 */
export async function getUserConfig<T>(key?: string): Promise<T> {
    return App.configure.get<T>(isNil(key) ? 'user' : `user.${key}`);
}

/**
 * 加密明文密码
 * @param password
 */
export const encrypt = async (password: string) => {
    return bcrypt.hashSync(password, await getUserConfig<number>('hash'));
};

/**
 * 验证密码
 * @param password
 * @param hashed
 */
export const decrypt = (password: string, hashed: string) => {
    return bcrypt.compareSync(password, hashed);
};

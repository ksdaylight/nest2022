import { isNil, toNumber } from 'lodash';

import {
    AppConfig,
    ConfigureFactory,
    ConfigureRegister,
    ConnectionOption,
    ConnectionRst,
} from '../types';

import { toBoolean } from './utils';

export const createConnectionOptions = <T extends Record<string, any>>(
    options: ConnectionOption<T>,
): ConnectionRst<T> => {
    const config: ConnectionRst<T> = Array.isArray(options)
        ? options
        : [{ ...options, name: 'default' }];
    if (config.length <= 0) return undefined;
    if (isNil(config.find(({ name }) => name === 'default'))) {
        config[0].name = 'default';
    }
    return config.reduce((o, n) => {
        const names = o.map(({ name }) => name) as string[];
        return names.includes(n.name) ? o : [...o, n];
    }, []);
};
export const createAppConfig: (
    register: ConfigureRegister<RePartial<AppConfig>>,
) => ConfigureFactory<AppConfig> = (register) => ({
    register,
    defaultRegister: (configure) => ({
        host: configure.env('APP_HOST', '127.0.0.1'),
        port: configure.env('APP_PORT', (v) => toNumber(v), 3000),
        https: configure.env('APP_SSL', (v) => toBoolean(v), false),
        timezone: configure.env('APP_TIMEZONE', 'Asia/Shanghai'),
        locale: configure.env('APP_LOCALE', 'zh-cn'),
    }),
});

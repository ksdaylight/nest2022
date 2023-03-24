import fs, { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import findUp from 'find-up';
import { ensureFileSync } from 'fs-extra';
import { get, has, isFunction, isNil, omit, set } from 'lodash';

import YAML from 'yaml';

import { EnvironmentType } from './constants';
import { deepMerge, isAsyncFn } from './helpers';
import { ConfigStorageOption, ConfigureFactory, ConfigureRegister } from './types';

export class Configure {
    protected inited = false;

    protected factories: Record<string, ConfigureFactory<Record<string, any>>> = {};

    protected config: Record<string, any> = {};

    protected yamlConfig: Record<string, any> = {};

    protected storage = false;

    protected yamlPath = path.resolve(__dirname, '../../..', 'config.ymal');

    constructor() {
        this.setRunEnv();
        this.loadEnvs();
    }

    init(option: ConfigStorageOption = {}) {
        if (this.inited) return this;
        const { storage, yamlPath } = option;
        if (!isNil(storage)) this.storage = storage;
        if (!isNil(yamlPath)) this.yamlPath = yamlPath;
        if (this.storage) this.enabledStorage();

        this.inited = true;
        return this;
    }

    protected enabledStorage() {
        this.storage = true;
        ensureFileSync(this.yamlPath);
        const yamlConfig = YAML.parse(readFileSync(this.yamlPath, 'utf8'));
        this.yamlConfig = isNil(yamlConfig) ? {} : yamlConfig;
        this.config = deepMerge(this.config, this.yamlConfig, 'replace');
    }

    protected setRunEnv() {
        if (
            isNil(process.env.NODE_ENV) ||
            !Object.values(EnvironmentType).includes(process.env.NODE_ENV as EnvironmentType)
        ) {
            process.env.NODE_ENV = EnvironmentType.PRODUCTION;
        }
    }

    protected loadEnvs() {
        if (!process.env.NODE_ENV) {
            process.env.NODE_ENV = EnvironmentType.PRODUCTION;
        }
        const search = [findUp.sync(['.env'])];
        if (process.env.NODE_ENV !== EnvironmentType.PRODUCTION) {
            search.push(findUp.sync([`.env.${process.env.NODE_ENV}`]));
        }
        const envFiles = search.filter((file) => file !== undefined) as string[];
        const fileEnvs = envFiles
            .map((filePath) => dotenv.parse(fs.readFileSync(filePath)))
            .reduce(
                (oc, nc) => ({
                    ...oc,
                    ...nc,
                }),
                {},
            );
        const envs = { ...process.env, ...fileEnvs };
        const keys = Object.keys(envs).filter((key) => !(key in process.env));
        keys.forEach((key) => {
            process.env[key] = envs[key];
        });
    }

    /*
    假设初始的环境变量为：


export DB_HOST=localhost
export DB_USER=root
export NODE_ENV=development
同时有一个名为 .env 的文件，其内容为：

makefile
Copy code
DB_HOST=127.0.0.1
DB_PASSWORD=password
那么，根据代码的执行逻辑，可以得到以下步骤和数据变化：

执行 if (!process.env.NODE_ENV) 语句，判断环境变量中是否定义了 NODE_ENV，由于已经定义，因此跳过此步骤。
执行 const search = [findUp.sync(['.env'])] 语句，查找名为 .env 的文件，返回值为 ['/path/to/.env']。
执行 if (process.env.NODE_ENV !== EnvironmentType.PRODUCTION) 语句，判断当前环境是否为生产环境，由于不是，因此跳过此步骤。
执行 const envFiles = search.filter((file) => file !== undefined) as string[] 语句，将返回值赋值给 envFiles 变量，此时 envFiles 的值为 ['/path/to/.env']。
执行 const fileEnvs = envFiles.map((filePath) => dotenv.parse(fs.readFileSync(filePath))).reduce((oc, nc) => ({ ...oc, ...nc }), {}) 语句，解析 .env 文件中的内容，并将解析后的内容赋值给 fileEnvs 变量。此时 fileEnvs 的值为 { DB_HOST: '127.0.0.1', DB_PASSWORD: 'password' }。
执行 const envs = { ...process.env, ...fileEnvs } 语句，将环境变量和 .env 文件中的内容合并，赋值给 envs 变量。此时 envs 的值为 { DB_HOST: '127.0.0.1', DB_USER: 'root', NODE_ENV: 'development', DB_PASSWORD: 'password' }。
执行 const keys = Object.keys(envs).filter((key) => !(key in process.env)) 语句，将过滤出在 envs 中存在但在 process.env 中不存在的键，即 DB_HOST 和 DB_PASSWORD。因此，此时 keys 的值为 ['DB_PASSWORD']。
执行 keys.forEach((key) => { process.env[key] = envs[key] }) 语句，将 .env 文件中的环境变量追加到 process.env 中，此时 process.env 的值为：
javascript
Copy code
export DB_HOST=localhost
export DB_USER=root
export NODE_ENV=development
export DB_PASSWORD=password
--------------------------------------------------------------------------------------------
protected loadEnvs() {
        if (!process.env.NODE_ENV) {
            process.env.NODE_ENV = EnvironmentType.PRODUCTION;
        }
        const search = [findUp.sync(['.env'])];
        if (process.env.NODE_ENV !== EnvironmentType.PRODUCTION) {
            search.push(findUp.sync([`.env.${process.env.NODE_ENV}`]));
        }
        const envFiles = search.filter((file) => file !== undefined) as string[];
        // 所有文件中配置的环境变量
        const fileEnvs = envFiles
            .map((filePath) => dotenv.parse(fs.readFileSync(filePath)))
            .reduce(
                (oc, nc) => ({
                    ...oc,
                    ...nc,
                }),
                {},
            );
        const keys = Object.keys(fileEnvs).filter((key) => !(key in process.env));

        keys.forEach((key) => {
            process.env[key] = envs[key];
        });
    }
举例，process.env不为空，为
export DB_HOST=localhost
export DB_USER=root
export NODE_ENV=development
.env 不为空，为
DB_HOST=127.0.0.1
DB_PASSWORD=password
.env.development 不为空，为
DB_HOST=0.0.0.0

解释执行的逻辑，以及它们每一步当前所有变量的数据变化
假设执行到这段代码时，process.env的值为：

css
Copy code
{
  DB_HOST: 'localhost',
  DB_USER: 'root',
  NODE_ENV: 'development'
}
.env文件的值为：

makefile
Copy code
DB_HOST=127.0.0.1
DB_PASSWORD=password
.env.development文件的值为：

makefile
Copy code
DB_HOST=0.0.0.0
if (!process.env.NODE_ENV): 这个条件不成立，跳过。
const search = [findUp.sync(['.env'])]: search数组的值为[".env"]。
if (process.env.NODE_ENV !== EnvironmentType.PRODUCTION): 这个条件成立，执行search.push(findUp.sync([.env.${process.env.NODE_ENV}]))，search数组的值变为[".env", ".env.development"]。
const envFiles = search.filter((file) => file !== undefined) as string[]: envFiles的值为[".env", ".env.development"]。
const fileEnvs = envFiles.map((filePath) => dotenv.parse(fs.readFileSync(filePath))).reduce((oc, nc) => ({...oc, ...nc}), {}): fileEnvs的值为{ DB_HOST: '0.0.0.0', DB_PASSWORD: 'password' }。这里的逻辑是读取文件内容，解析为环境变量对象，然后合并成一个对象。
const keys = Object.keys(fileEnvs).filter((key) => !(key in process.env)): keys的值为["DB_PASSWORD"]。这里的逻辑是找到所有在.env和.env.development中定义的，但是在process.env中不存在的环境变量的键名。
keys.forEach((key) => {process.env[key] = envs[key]}): 将fileEnvs中所有不存在于process.env中的环境变量追加到process.env中。此时process.env的值变为：
css
Copy code
{
  DB_HOST: 'localhost',
  DB_USER: 'root',
  NODE_ENV: 'development',
  DB_PASSWORD: 'password'
}
需要注意的是，在这个过程中，DB_HOST的值并没有被修改，因为它在.env.development文件中的定义被忽略了，原因是它在process.env中已经有了定义。因此，在这个例子中，DB_PASSWORD是唯一一个被追加到process.env中的变量。
"就是先把cli里面传入的给过滤出来"




    */
    getRunEnv(): EnvironmentType {
        return process.env.NODE_ENV as EnvironmentType;
    }

    // todo 我也没看到其它的重载的实现啊....
    env(): { [key: string]: string };
    env<T extends BaseType = string>(key: string): T;
    env<T extends BaseType = string>(key: string, parseTo: ParseType<T>): T;
    env<T extends BaseType = string>(key: string, defaultValue: T): T;
    env<T extends BaseType = string>(key: string, parseTo: ParseType<T>, defaultValue: T): T;
    env<T extends BaseType = string>(key?: string, parseTo?: ParseType<T> | T, defaultValue?: T) {
        if (!key) return process.env;
        const value = process.env[key];
        if (value !== undefined) {
            if (parseTo && isFunction(parseTo)) {
                return parseTo(value);
            }
            return value as T;
        }
        if (parseTo === undefined && defaultValue === undefined) {
            return undefined;
        }
        if (parseTo && defaultValue === undefined) {
            return isFunction(parseTo) ? undefined : parseTo;
        }
        return defaultValue! as T;
    }

    // protected factories: Record<string, ConfigureFactory<Record<string, any>>> = {};

    all() {
        return this.config;
    }

    has(key: string) {
        return has(this.config, key);
    }

    async get<T>(key: string, defaultValue?: T): Promise<T> {
        if (!has(this.config, key) && defaultValue === undefined && has(this.factories, key)) {
            await this.syncFactory(key);
            return this.get(key, defaultValue);
        }
        return get(this.config, key, defaultValue) as T;
    }

    set<T>(key: string, value: T, storage = false, append = false) {
        if (storage && this.storage) {
            ensureFileSync(this.yamlPath);
            set(this.yamlConfig, key, value);
            writeFileSync(this.yamlPath, JSON.stringify(this.yamlConfig, null, 4));
            this.config = deepMerge(this.config, this.yamlConfig, append ? 'merge' : 'replace');
        } else {
            set(this.config, key, value);
        }
        return this;
    }

    add<T extends Record<string, any>>(
        key: string,
        register: ConfigureRegister<T> | ConfigureFactory<T>,
    ) {
        if (!isFunction(register) && 'register' in register) {
            this.factories[key] = register as any;
        } else if (isFunction(register)) {
            this.factories[key] = { register };
        }

        return this;
    }

    remove(key: string) {
        if (has(this.yamlConfig, key) && this.storage) {
            this.yamlConfig = omit(this.yamlConfig, [key]);
            if (has(this.config, key)) omit(this.config, [key]);
            writeFileSync(this.yamlPath, JSON.stringify(this.yamlConfig, null, 4));
            this.config = deepMerge(this.config, this.yamlConfig, 'replace');
        } else if (has(this.config, key)) {
            this.config = omit(this.config, [key]);
        }
        return this;
    }

    store(key: string) {
        if (!this.storage) throw new Error('must enable storage at first!');
        ensureFileSync(this.yamlPath);
        set(this.yamlConfig, key, this.get(key, null));
        writeFileSync(this.yamlPath, JSON.stringify(this.yamlConfig, null, 4));
        this.config = deepMerge(this.config, this.yamlConfig, 'replace');
        return this;
    }

    protected async syncFactory(key: string) {
        if (has(this.config, key)) return this;
        const { register, defaultRegister, storage, hook, append } = this.factories[key];
        let defaultValue = {};
        let value = isAsyncFn(register) ? await register(this) : register(this);
        if (!isNil(defaultRegister)) {
            defaultValue = isAsyncFn(defaultRegister)
                ? await defaultRegister(this)
                : defaultRegister(this);
            value = deepMerge(defaultValue, value, 'replace');
        }
        if (!isNil(hook)) {
            value = isAsyncFn(hook) ? await hook(this, value) : hook(this, value);
        }
        this.set(key, value, storage && isNil(await this.get(key, null)), append);
        return this;
    }

    async sync(name?: string) {
        if (!isNil(name)) await this.syncFactory(name);
        else {
            for (const key in this.factories) {
                await this.syncFactory(key);
            }
        }
    }
}

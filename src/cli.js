#!/usr/bin/env node
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable import/no-extraneous-dependencies */
const { existsSync } = require('fs');
const { join } = require('path');

const projectPath = join(__dirname, '../tsconfig.build.json');
if (existsSync(projectPath)) {
    require('ts-node').register({
        files: true,
        transpileOnly: true,
        project: projectPath,
    });
    require('tsconfig-paths/register');
}

const { creator } = require('./creator');
const { buildCli } = require('./modules/core/helpers/app');

buildCli(creator);
/*
if 语句块之后，添加下面这句话：
require('tsconfig-paths/register');
那么这是因为 tsconfig-paths/register 模块的作用是根据 tsconfig.json（本项目中为tsconfig.build.json） 中的配置设置 module-alias，以便在应用程序中使用别名路径。

在代码中，如果 tsconfig.build.json 文件存在，那么就说明这是在编译后的生产环境中运行的，需要使用该文件作为 TypeScript 编译器的项目配置文件，并使用 tsconfig-paths/register 模块来设置别名路径，以确保正确加载模块。

如果不添加该语句，当在生产环境中使用别名路径时，将会抛出模块找不到的错误。

在源码环境下使用./src/cli.js -h或者node ./src/cli.js -h查看命令列表（加不加-h都可以），在编译文件中（比如生成环境下只部署了dist目录），可以直接./cli.js -h或node ./cli.js -h运行命令

源码环境中：
chmod +x ./src/cli.js来设置一下可执行权限
编译环境中：
todo
*/

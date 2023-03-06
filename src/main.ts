import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import * as configs from './config';
import { ContentModule } from './modules/content/content.module';
import { bootApp, createApp } from './modules/core/helpers/app';

bootApp(
    createApp({
        configs,
        configure: { storage: true },
        modules: [ContentModule],
        builder: async ({ configure, BootModule }) => {
            return NestFactory.create<NestFastifyApplication>(BootModule, new FastifyAdapter(), {
                cors: true,
                logger: ['error', 'warn'],
            });
        },
    }),
);

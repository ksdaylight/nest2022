import { ClassToPlain, RecordNever } from 'typings/global';

import { DynamicRelation } from '../database/types';

import {
    CaptchaActionType,
    CaptchaDtoGroups,
    CaptchaType,
    EmailCaptchaOption,
    PhoneCaptchaOption,
} from './constants';
import { MessageEntity } from './entities';

/**
 * JWT配置
 */
export interface JwtConfig {
    secret: string;
    token_expired: number;
    refresh_secret: string;
    refresh_token_expired: number;
}

export type UserEnabled = `${CaptchaDtoGroups}` | 'message';
/**
 * 默认验证码配置
 */
export interface CaptchaConfig {
    [CaptchaType.PHONE]: {
        [key in CaptchaActionType]: PhoneCaptchaOption;
    };
    [CaptchaType.EMAIL]: {
        [key in CaptchaActionType]: EmailCaptchaOption;
    };
}
/**
 * 自定义用户模块配置
 */
export interface UserConfig {
    enables: UserEnabled[];
    super: {
        username: string;
        password: string;
    };
    /**
     * 默认用户头像
     */
    avatar: string;
    hash: number;
    jwt: JwtConfig;
    captcha: CaptchaConfig;
    relations: DynamicRelation[];
}

/**
 * JWT荷载
 */
export interface JwtPayload {
    sub: string;
    iat: number;
}

/**
 * 通用验证码选项
 */
export interface CaptchaTimeOption {
    limit: number; // 验证码发送间隔时间
    expired: number; // 验证码有效时间
}

/**
 * 验证码正确性验证
 */
export type CaptchaValidate<T extends Record<string, any> = RecordNever> = T & {
    value: string;
    code: string;
};

/**
 * 异步存储消息的数据类型
 */
export type SaveMessageQueueJob = Pick<ClassToPlain<MessageEntity>, 'title' | 'body' | 'type'> & {
    receviers: string[];
    sender: string;
};

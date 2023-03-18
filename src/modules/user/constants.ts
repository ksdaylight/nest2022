/**
 * 验证码操作类别
 */
export enum CaptchaActionType {
    // 登录操作
    LOGIN = 'login',
    // 注册操作
    REGISTER = 'register',
    // 找回密码操作
    RETRIEVEPASSWORD = 'retrieve-password',
    // 重置密码操作
    RESETPASSWORD = 'reset-password',
    // 手机号或邮箱地址绑定操作
    ACCOUNTBOUND = 'account-bound',
}
/**
 * 通用验证码选项
 */
export interface CaptchaTimeOption {
    limit: number; // 验证码发送间隔时间
    expired: number; // 验证码有效时间
}
/**
 * 手机验证码选项
 */
export interface PhoneCaptchaOption extends CaptchaTimeOption {
    template: string; // 云厂商短信推送模板ID
}
/**
 * 邮件验证码选项
 */
export interface EmailCaptchaOption extends CaptchaTimeOption {
    subject: string; // 邮件主题
    template?: string; // 模板路径
}

/**
/**
 * 验证码类型
 */
export enum CaptchaType {
    PHONE = 'phone',
    EMAIL = 'email',
}

/**
 * 用户列表查询排序方式
 */
export enum UserOrderType {
    CREATED = 'createdAt',
    UPDATED = 'updatedAt',
}

/**
 * 用户请求DTO验证组
 */
export enum UserDtoGroups {
    REGISTER = 'user-register',
    CREATE = 'user-create',
    UPDATE = 'user-update',
    BOUND = 'account-bound',
}
/**
 * 验证码发送数据DTO验证组
 */
export enum CaptchaDtoGroups {
    // 发送短信登录验证码
    PHONE_LOGIN = 'phone-login',
    // 发送邮件登录验证码
    EMAIL_LOGIN = 'email-login',
    // 发送短信注册验证码
    PHONE_REGISTER = 'phone-register',
    // 发送邮件注册验证码
    EMAIL_REGISTER = 'email-register',
    // 发送找回密码的短信验证码
    PHONE_RETRIEVE_PASSWORD = 'phone-retrieve-password',
    // 发送找回密码的邮件验证码
    EMAIL_RETRIEVE_PASSWORD = 'email-retrieve-password',
    // 发送手机号绑定或更改的短信验证码
    PHONE_BOUND = 'phone-bound',
    // 发送邮箱地址绑定或更改的邮件验证码
    EMAIL_BOUND = 'email-bound',
}
/**
 * 消息接收者操作类型
 */
export enum RecevierActionType {
    READED = 'readed',
    DELETE = 'delete',
}

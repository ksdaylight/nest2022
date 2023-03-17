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
 * 验证码类型
 */
export enum CaptchaType {
    PHONE = 'phone',
    EMAIL = 'email',
}

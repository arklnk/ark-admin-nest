-- 变更配置盐值时需重置用户密码的SQL脚本

-- 用户默认密码
SET @user_default_pwd := '123456';
-- 用户密码盐值
SET @user_pwd_salt := 'K8i8mTfc5sTXO7OG';

UPDATE `sys_user` SET `password` = MD5(CONCAT(@user_default_pwd, @user_pwd_salt)) WHERE 1 = 1;
<!-- eslint-disable -->
<template>
    <div class="login-container">
        <el-card class="login-box">
            <!-- 系统名称 -->
            <div class="system-name">
                <h2>扬州旅游路线推荐系统</h2>
            </div>

            <!-- 登录表单 -->
            <el-form ref="loginForm" :model="form" :rules="rules" label-width="80px" label-position="top">
                <!-- 修改账号输入为手机号输入 -->
                <el-form-item label="账号" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入账号">
                        <i slot="prefix" class="el-icon-user"></i>
                    </el-input>
                </el-form-item>

                <!-- 密码输入保持不变 -->
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码">
                        <i slot="prefix" class="el-icon-lock"></i>
                        <i slot="suffix" class="el-icon-view" @click="togglePasswordVisible"
                            style="cursor: pointer;"></i>
                    </el-input>
                </el-form-item>

                <!-- 按钮组 -->
                <el-form-item class="button-group">
                    <el-button type="primary" @click="handleLogin" class="login-btn">
                        登录
                    </el-button>
                    <el-button type="info" @click="handleRegister" class="register-btn">
                        注册
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
import axios from 'axios'  // 移到顶部

export default {
    name: 'LoginPage',
    data() {
        return {
            form: {
                phone: '',
                password: ''
            },
            rules: {
                phone: [    // 修改 account 为 phone
                    { required: true, message: '请输入账号', trigger: 'blur' },
                    { pattern: /^[a-zA-Z0-9]{3,11}$/, message: '请输入3-11位字母或数字', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        togglePasswordVisible() {
            const input = this.$el.querySelector('input[type="password"]')
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password'
            }
        },
        handleLogin() {
            this.$refs.loginForm.validate(async valid => {
                if (valid) {
                    // admin 用户特殊处理
                    if (this.form.phone === 'admin') {
                        this.$message({
                            message: '管理员登录成功！',
                            type: 'success',
                            duration: 1000  // 设置显示时间为1秒
                        });
                        localStorage.setItem('user', JSON.stringify({ phone: 'admin' }));
                        this.$router.push('/admin');
                        return;
                    }

                    // 普通用户的登录逻辑
                    try {
                        const response = await axios.post('/api/user/login', null, {
                            params: {
                                phone: this.form.phone,
                                password: this.form.password
                            }
                        });
                        
                        // 处理响应
                        if (response.data.code === 1) {
                            // 登录成功
                            this.$message.success('登录成功！');
                            // 保存用户信息
                            localStorage.setItem('user', JSON.stringify(response.data.data));
                            // 跳转到首页
                            this.$router.push('/home');
                        } else {
                            // 登录失败
                            this.$message.error(response.data.msg || '用户名或密码错误');
                        }
                    } catch (error) {
                        console.error('登录错误:', error);
                        this.$message.error('登录失败，请稍后重试');
                    }
                }
            })
        },
        handleRegister() {
            this.$router.push('/register')
        }
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: url('~@/assets/竹子登录.jpg') no-repeat center center fixed;
    background-size: cover;
    position: relative;
}

.login-box {
    width: 400px;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    background: rgba(255, 254, 254, 0.8);
    backdrop-filter: blur(5px); /* 毛玻璃效果 */

}

.system-name {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.system-name h2 {
    font-size: 24px;
    margin: 0;
}

.button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.login-btn {
    flex: 1;
    margin-right: 10px;
}

.register-btn {
    flex: 1;
    margin-left: 10px;
}

.el-icon-user,
.el-icon-lock {
    margin-left: 5px;
    color: #c0c4cc;
}
</style>

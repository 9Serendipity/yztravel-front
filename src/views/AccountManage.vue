<template>
    <div>
        <!-- 添加顶部菜单栏 -->
        <el-menu :default-active="'/account'" class="custom-menu" mode="horizontal" router>
            <el-menu-item index="/home">首页</el-menu-item>
            <el-menu-item index="/recommend">推荐</el-menu-item>
            <el-menu-item index="/routes">路线</el-menu-item>
            <el-menu-item index="/food">美食</el-menu-item>
            <el-menu-item index="/account">账号</el-menu-item>
        </el-menu>

        <!-- 原有的账号管理内容 -->
        <div class="account-container">
            <el-card class="account-card">
                <!-- 保持原有内容不变 -->
                <!-- 添加用户头像 -->
                <template>
                    <div class="avatar-container">
                        <el-upload class="avatar-uploader" :action="`/api/user/upload-avatar`"
                            :data="{ usersId: userInfo.usersId }" :show-file-list="false" :on-success="handleAvatarSuccess"
                            :before-upload="beforeAvatarUpload">
                            <el-avatar :size="100" :src="userAvatar" class="user-avatar">
                                {{ userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U' }}
                            </el-avatar>
                        </el-upload>
                    </div>
                </template>
                <div class="header">
                    <h2>账号管理</h2>
                </div>

                <el-form :model="userInfo" :rules="rules" ref="userForm" label-width="100px">
                    <el-form-item label="手机号" prop="phone">
                        <el-input v-model="userInfo.phone" disabled></el-input>
                    </el-form-item>

                    <el-form-item label="用户名" prop="name">
                        <el-input v-model="userInfo.name"></el-input>
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                        <el-input v-model="userInfo.password" type="password" show-password></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="handleUpdate">保存修改</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'AccountManage',
    data() {
        return {
            userInfo: {
                usersId: '',        // 添加用户ID字段
                phone: '',
                name: '',
                password: '',
                avatarUrl: ''  // 添加头像URL字段
            },
            rules: {
                name: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        // 页面创建时获取用户信息
        this.getUserInfo()
    },
    methods: {
        async getUserInfo() {
            try {
                // 从本地存储获取用户ID
                const userStr = localStorage.getItem('user')
                const user = userStr ? JSON.parse(userStr) : {}

                // 发送请求时带上用户ID
                const response = await axios.post('/api/user/info', {
                    usersId: user.usersId  // 改为 usersId
                })
        
                if (response.data.code === 1) {
                    this.userInfo = {
                        ...response.data.data,
                        avatarUrl: response.data.data.avatarUrl || ''
                    }
                    localStorage.setItem('user', JSON.stringify(this.userInfo))
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
                // 如果获取失败，尝试从本地存储获取
                const userStr = localStorage.getItem('user')
                if (userStr) {
                    this.userInfo = JSON.parse(userStr)
                }
            }
        },
        handleUpdate() {
            this.$refs.userForm.validate(async valid => {
                if (valid) {
                    try {
                        // 构造更新数据
                        const updateData = {
                            usersId: this.userInfo.usersId,  // 改为 usersId
                            phone: this.userInfo.phone,
                            password: this.userInfo.password,
                            name: this.userInfo.name,  // 注意：后端实体类中是 name
                            avatarUrl: this.userInfo.avatarUrl
                        }
                        
                        const response = await axios.post('/api/user/update', updateData)
                        if (response.data.code === 1) {
                            this.$message.success('更新成功')
                            // 更新本地存储的用户信息
                            localStorage.setItem('user', JSON.stringify(this.userInfo))
                        } else {
                            this.$message.error(response.data.msg || '更新失败')
                        }
                    } catch (error) {
                        console.error('更新失败:', error)
                        this.$message.error('更新失败，请稍后重试')
                    }
                }
            })
        },
        resetForm() {
            this.$refs.userForm.resetFields()
            this.getUserInfo()
        },
        // 添加这两个新方法到 methods 中
        handleAvatarSuccess(response) {
            if (response.code === 1) {
                this.userInfo.avatarUrl = response.data.url
                // 更新用户信息
                this.handleUpdate()
            }
        },
        beforeAvatarUpload(file) {
            const isImage = file.type.startsWith('image/')
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!isImage) {
                this.$message.error('上传头像图片只能是图片格式!')
                return false
            }
            if (!isLt2M) {
                this.$message.error('上传头像图片大小不能超过 2MB!')
                return false
            }
            return true
        }
    },
    computed: {
        userAvatar() {
            return this.userInfo.avatarUrl || ''  // 如果没有头像则返回空字符串
        }
    }
}
</script>

<style scoped>
/* 添加菜单样式，与 HomePage 保持一致 */
.custom-menu {
    --menu-text: #57573e;
    --menu-hover-text: #57573e;
    --menu-active-text: #000000;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    width: 100%;
    background: url('@/assets/菜单栏.jpg') !important;
    background-size: cover !important;
    background-position: center !important;
}

.el-menu>.el-menu-item {
    flex: 1;
    font-family: "华文中宋", "STZhongsong", sans-serif;
    font-size: 23px;
    max-width: 15%;
    text-align: center;
    transition: all 0.3s ease !important;
    background-color: transparent !important;
    color: var(--menu-text) !important;
}

.custom-menu>.el-menu-item:hover {
    background-color: transparent !important;
    display: inline-block;
    transform: scale(1.4);
    transition: transform 0.3s ease;
    color: var(--menu-hover-text) !important;
}

.custom-menu>.el-menu-item.is-active {
    border-bottom: transparent !important;
    font-size: 24px;
    transform: scale(1.5);
    color: var(--menu-active-text) !important;
}

/* 调整原有样式 */
.account-container {
    padding: 40px 20px;
    min-height: calc(100vh - 60px);
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
}

.account-card {
    width: 500px;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.8);
    /* 半透明白色背景 */
    backdrop-filter: blur(5px);
    /* 毛玻璃效果 */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* 移除 el-card 的边框和阴影 */
:deep(.el-card) {
    border: none !important;
    box-shadow: none !important;
}

.header {
    text-align: center;
    margin-bottom: 30px;
}

.header h2 {
    color: #333;
    margin: 0;
    font-family: "华文中宋", "STZhongsong", sans-serif;
}

/* 添加头像容器样式 */
.avatar-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
}

.user-avatar {
    border: 4px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: #409EFF;
    color: #fff;
    font-size: 36px;
    font-family: "华文中宋", "STZhongsong", sans-serif;
}
</style>
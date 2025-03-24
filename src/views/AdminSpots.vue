<template>
    <div>
        <el-menu :default-active="'/admin/spots'" class="custom-menu" mode="horizontal" router>
            <el-menu-item index="/home">首页</el-menu-item>
            <el-menu-item index="/admin/spots">景点管理</el-menu-item>
        </el-menu>

        <div class="admin-container">
            <el-card class="admin-card">
                <div class="header">
                    <h2>景点管理</h2>
                    <el-button type="primary" @click="handleAdd">添加景点</el-button>
                </div>

                <!-- 添加景点对话框 -->
                <!-- 修改对话框标题 -->
                <el-dialog :title="isEdit ? '编辑景点' : '添加景点'" :visible.sync="dialogVisible" width="50%">
                    <el-form :model="spotForm" :rules="rules" ref="spotForm" label-width="100px">
                        <el-form-item label="景点名称" prop="attractionName">
                            <el-input v-model="spotForm.attractionName"></el-input>
                        </el-form-item>

                        <el-form-item label="景点描述" prop="attractionDescription">
                            <el-input type="textarea" v-model="spotForm.attractionDescription" rows="4"></el-input>
                        </el-form-item>

                        <el-form-item label="景点地点" prop="attractionLocal">
                            <el-input v-model="spotForm.attractionLocal"></el-input>
                        </el-form-item>

                        <el-form-item label="门票价格" prop="attractionPrice">
                            <el-input-number v-model="spotForm.attractionPrice" :min="0"
                                :precision="2"></el-input-number>
                        </el-form-item>

                        <el-form-item label="景点标签" prop="label">
                            <el-input v-model="spotForm.label" placeholder="请输入标签，多个标签用逗号分隔" clearable>
                            </el-input>
                        </el-form-item>

                        <el-form-item label="景点类别" prop="classify">
                            <el-select v-model="spotForm.classify" placeholder="请选择类别">
                                <el-option v-for="cat in categoryOptions" :key="cat" :label="cat"
                                    :value="cat"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="游玩时间" prop="travelTime">
                            <el-input-number v-model="spotForm.travelTime" :min="0.5" :step="0.5"
                                :precision="1"></el-input-number>
                            <span class="time-unit">小时</span>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="dialogVisible = false">取 消</el-button>
                        <el-button type="primary" @click="handleSubmit">确 定</el-button>
                    </span>
                </el-dialog>

                <!-- 景点列表 -->
                <el-table :data="spots" style="width: 100%" border class="centered-table">
                    <el-table-column prop="attractionName" label="景点名称">
                        <template slot-scope="scope">
                            <div>{{ scope.row.attractionName }}</div>
                            <el-button size="mini" type="success" style="margin-top: 5px"
                                @click="handleAddImage(scope.row)">添加图片</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="attractionLocal" label="地点"></el-table-column>
                    <el-table-column prop="attractionPrice" label="价格">
                        <template slot-scope="scope">
                            ¥{{ scope.row.attractionPrice }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="classify" label="类别"></el-table-column>
                    <el-table-column prop="travelTime" label="游玩时间">
                        <template slot-scope="scope">
                            {{ scope.row.travelTime }}小时
                        </template>
                    </el-table-column>
                    // 在 template 中的标签显示部分
                    <el-table-column prop="label" label="标签">
                        <template slot-scope="scope">
                            <el-tag v-for="tag in scope.row.label.split(/[,，]/).filter(Boolean)" :key="tag" size="small"
                                style="margin-right: 5px">
                                {{ tag }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                        <template slot-scope="scope">
                            <div style="display: inline-block">
                                <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                                <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>

        <!-- 添加图片上传对话框 -->
        <el-dialog title="添加图片" :visible.sync="imageDialogVisible" width="30%">
            <el-form :model="imageForm" ref="imageForm" label-width="80px">
                <el-form-item label="图片URL" prop="imageUrl">
                    <el-input v-model="imageForm.imageUrl" placeholder="请输入图片URL"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="imageDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitImage">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'AdminSpots',
    // 在 data 中也需要修改表单字段名称
    data() {
        return {
            isEdit: false,  // 添加标识
            dialogVisible: false,
            spots: [],
            spotForm: {
                attractionName: '',
                attractionDescription: '',
                attractionLocal: '',
                attractionPrice: 0,
                label: '',
                classify: '',
                travelTime: 1
            },
            imageDialogVisible: false,
            imageForm: {
                imageUrl: '',
                attractionId: null
            },
            // 删除这一行
            // tagOptions: ['历史', '文化', '自然', '古迹', '园林', '寺庙', '博物馆'],
            categoryOptions: ['景区', '公园', '寺庙', '博物馆', '古迹'],
            rules: {
                attractionName: [
                    { required: true, message: '请输入景点名称', trigger: 'blur' },
                    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                ],
                attractionDescription: [
                    { required: true, message: '请输入景点描述', trigger: 'blur' }
                ],
                attractionLocal: [
                    { required: true, message: '请输入景点地点', trigger: 'blur' }
                ],
                attractionPrice: [
                    { required: true, message: '请输入门票价格', trigger: 'blur' }
                ],
                classify: [
                    { required: true, message: '请选择景点类别', trigger: 'change' }
                ],
                travelTime: [
                    { required: true, message: '请输入游玩时间', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        async loadSpots() {
            try {
                const response = await axios.get('/api/spots/all/admin')
                if (response.data.code === 1) {
                    console.log('后端返回的景点数据:', response.data.data)  // 添加这行来查看数据
                    this.spots = response.data.data
                }
            } catch (error) {
                console.error('获取景点列表失败:', error)
                this.$message.error('获取景点列表失败')
            }
        },
        // 修改提交方法以处理标签
        handleSubmit() {
            this.$refs.spotForm.validate(async valid => {
                if (valid) {
                    try {
                        const submitData = {
                            ...this.spotForm,
                            label: this.spotForm.label.split(/[,，]/).filter(Boolean).join(',')
                        }

                        let response
                        if (this.isEdit) {
                            response = await axios.put(`/api/spots/attractions/${submitData.attractionId}`, submitData)
                        } else {
                            response = await axios.post('/api/spots/add', submitData)
                        }

                        if (response.data.code === 1) {
                            this.$message.success(this.isEdit ? '修改成功' : '添加成功')
                            this.dialogVisible = false
                            this.loadSpots()
                            this.$refs.spotForm.resetFields()
                        }
                    } catch (error) {
                        this.$message.error(this.isEdit ? '修改失败' : '添加失败')
                    }
                }
            })
        },
        async handleDelete(row) {
            try {
                await this.$confirm('确认删除该景点?', '提示', {
                    type: 'warning'
                })
                const response = await axios.delete(`/api/spots/attractions/${row.attractionId}`)  // 修改为正确的删除接口
                if (response.data.code === 1) {
                    this.$message.success('删除成功')
                    this.loadSpots()
                } else {
                    this.$message.error(response.data.msg || '删除失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除失败:', error)
                    this.$message.error('删除失败')
                }
            }
        },
        handleAdd() {
            this.isEdit = false
            this.dialogVisible = true
            this.spotForm = {
                attractionName: '',
                attractionDescription: '',
                attractionLocal: '',
                attractionPrice: 0,
                label: '',
                classify: '',
                travelTime: 1
            }
        },
        // 修改 handleEdit 方法
        handleEdit(row) {
            this.isEdit = true
            this.spotForm = {
                ...row,
                // 不需要再分割标签，直接使用原始字符串
                label: row.label || ''
            }
            this.dialogVisible = true
        },
        handleAddImage(row) {
            this.imageDialogVisible = true
            this.imageForm.attractionId = row.attractionId
            this.imageForm.imageUrl = ''
        },

        // 添加提交图片的方法
        async submitImage() {
            try {
                const response = await axios.post('/api/spots/images/add', this.imageForm)
                if (response.data.code === 1) {
                    this.$message.success('图片添加成功')
                    this.imageDialogVisible = false
                    this.loadSpots() // 刷新数据
                } else {
                    this.$message.error(response.data.msg || '添加失败')
                }
            } catch (error) {
                console.error('添加图片失败:', error)
                this.$message.error('添加图片失败')
            }
        }
    },
    created() {
        this.loadSpots()
    }
}
</script>

<style scoped>
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

.admin-container {
    padding: 40px 20px;
    min-height: calc(100vh - 60px);
    background-color: transparent;
}

.admin-card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 15px;
    margin: 0 auto;
    max-width: 1200px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    font-family: "华文中宋", "STZhongsong", sans-serif;
    color: #333;
}

.time-unit {
    margin-left: 10px;
}

:deep(.el-dialog) {
    border-radius: 15px;
}

.centered-table {
    text-align: center;
}

.centered-table /deep/ .cell {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
</style>
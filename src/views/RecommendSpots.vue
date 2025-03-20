<template>
  <div>
    <el-menu :default-active="'/recommend'" class="custom-menu" mode="horizontal" router>
      <el-menu-item index="/home">首页</el-menu-item>
      <el-menu-item index="/recommend">推荐</el-menu-item>
      <el-menu-item index="/routes">路线</el-menu-item>
      <el-menu-item index="/food">美食</el-menu-item>
      <el-menu-item index="/account">账号</el-menu-item>
    </el-menu>

    <div class="recommend-container">
      <!-- 用户偏好选择区域 -->
      <el-card class="preference-card">
        <div class="preference-form">
          <h3>景点推荐</h3>
          <el-form :model="userPreference" label-width="100px">
            <!-- 景点类型偏好 -->
            <el-form-item label="景点类型">
              <el-checkbox-group v-model="userPreference.types">
                <el-checkbox label="历史文化">历史文化</el-checkbox>
                <el-checkbox label="园林">园林</el-checkbox>
                <el-checkbox label="自然风光">自然风光</el-checkbox>
                <el-checkbox label="寺庙">寺庙</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <!-- 游玩时长 -->
            <el-form-item label="游玩时长">
              <el-select v-model="userPreference.duration">
                <el-option label="2小时以内" value="2"></el-option>
                <el-option label="2-4小时" value="4"></el-option>
                <el-option label="4小时以上" value="6"></el-option>
              </el-select>
            </el-form-item>

            <!-- 预算范围 -->
            <el-form-item label="预算范围">
              <el-slider
                v-model="userPreference.budget"
                range
                :min="0"
                :max="100"
                :step="10"
              ></el-slider>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="getRecommendations">获取推荐</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <!-- 修改推荐结果展示区域 -->
      <!-- 在景点卡片中添加按钮 -->
      <el-row :gutter="20" class="recommend-list">
        <el-col :span="8" v-for="recommendation in recommendedSpots" :key="recommendation.spot.attractionId">
          <el-card :body-style="{ padding: '0px' }" class="spot-card">
            <img :src="recommendation.spot.imageUrl" class="spot-image">
            <div class="spot-info">
              <h4>{{ recommendation.spot.attractionName }}</h4>
              <p>{{ recommendation.spot.attractionDescription }}</p>
              <div class="spot-tags">
                <el-tag size="small">{{ recommendation.spot.classify }}</el-tag>
                <el-tag size="small" type="success">￥{{ recommendation.spot.attractionPrice }}</el-tag>
                <el-tag size="small" type="warning">{{ recommendation.spot.travelTime }}小时</el-tag>
                <el-tag size="small" type="info">匹配度: {{ (recommendation.score * 100).toFixed(1) }}%</el-tag>
              </div>
              <div class="button-container">
                <el-button type="primary" size="small" @click="planRoute(recommendation.spot)">
                  景点详情
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RecommendSpots',
  data() {
    return {
      userPreference: {  // 用户偏好设置
        types: [],       // 存储用户选择的景点类型，如["历史文化", "园林"]
        duration: '2',   // 存储用户选择的游玩时长，默认为2小时
        budget: [0, 100] // 存储用户选择的预算范围，默认0-100元
      },
      recommendedSpots: [] // 存储推荐的景点列表
    }
  },
  methods: {
    async getRecommendations() {
      try {
        // 检查用户是否登录
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          this.$message.warning('请先登录')
          this.$router.push('/login')
          return
        }

        const user = JSON.parse(userStr)
        if (!user.usersId) {
          this.$message.warning('用户信息不完整，请重新登录')
          this.$router.push('/login')
          return
        }

        const response = await axios.post('/api/spots/recommend', {
          preferences: this.userPreference,
          usersId: user.usersId
        })
        
        if (response.data.code === 1) {
          this.recommendedSpots = response.data.data
        } else {
          this.$message.error('获取推荐失败')
        }
      } catch (error) {
        console.error('推荐请求失败:', error)
        this.$message.error('获取推荐失败，请稍后重试')
      }
    },
    planRoute(spot) {
      // 将选中的景点信息存储到本地
      localStorage.setItem('selectedSpot', JSON.stringify(spot))
      // 使用动态路由跳转，携带景点ID
      this.$router.push(`/routes/${spot.attractionId}`)
    }
  }
}
</script>

<style scoped>

/* 菜单样式 */
.custom-menu {
  --menu-text: #57573e;
  /* 默认文字颜色 */
  --menu-hover-text: #57573e;
  /* 悬停文字颜色 */
  --menu-active-text: #000000;
  /* 激活状态颜色 */
  /* 开启 Flex 布局 */
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  /* 修改背景设置 */
  background: url('@/assets/菜单栏.jpg') !important;
  /* 替换背景色为图片 */
  background-size: cover !important;
  /* 确保图片覆盖整个区域 */
  background-position: center !important;
  /* 图片居中显示 */
}

/* 菜单项通用样式 */
.el-menu>.el-menu-item,
.el-menu>.el-submenu {
  /* 同时作用于普通菜单项和下拉菜单 */
  flex: 1;
  font-family: "华文中宋", "STZhongsong", sans-serif;
  /* 修改字体 */
  font-size: 23px;
  /* 添加默认字体大小 */
  max-width: 15%;
  text-align: center;
  transition: all 0.3s ease !important;
  /* 添加过渡效果 */
  background-color: transparent !important;
  /* 移除默认背景 */
  color: var(--menu-text) !important;
}

/* 悬停效果设置 */
.custom-menu>.el-menu-item:hover {
  background-color: transparent !important;
  /* 保持背景不变 */
  display: inline-block;
  transform: scale(1.4);
  /* 文字缩放 */
  transition: transform 0.3s ease;
  /* 缩放过渡 */
  color: var(--menu-hover-text) !important;
  /*移除默认颜色变化*/
}

/* 保持激活状态样式 */
.custom-menu>.el-menu-item.is-active,
.custom-menu>.el-submenu.is-active {
  border-bottom: transparent !important;
  font-size: 24px;
  /* 添加激活时的字体大小 */
  transform: scale(1.5);
  /* 可选：添加整体放大效果 */
  color: var(--menu-active-text) !important;
}

/* 按钮样式 */
.button-container {
        margin-top: 10px;
        text-align: right;
      }
</style>
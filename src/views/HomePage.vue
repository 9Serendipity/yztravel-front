<template>
  <div>
    <el-container>
      <el-menu :default-active="activeIndex" class="custom-menu" mode="horizontal" @select="handleSelect" router>
        <el-menu-item index="/home">首页</el-menu-item>
        <el-menu-item index="/recommend">推荐</el-menu-item>
        <el-menu-item index="/routes">路线</el-menu-item>
        <el-menu-item index="/food">美食</el-menu-item>
        <el-menu-item index="/account">账号</el-menu-item>
      </el-menu>

      <!-- 替换原来的 el-main，改为四个内容区域 -->
      <el-main>
        <div class="box">
          <div class="banner">
            <el-row v-for="(section, index) in sections" :key="index" :class="['content-section', section.class]">
              <el-col :span="24">
                <div class="section-container"> <!-- v-for循环渲染下面四个区域 -->
                  <!-- 为景点区域添加轮播图 -->
                  <template v-if="section.class === 'scenic-spots'">
                    <el-carousel :interval="4000" type="card" height="400px"> <!-- 修改height属性 -->
                      <el-carousel-item v-for="item in carouselImages" :key="item.id">
                        <img :src="item.url" :alt="item.title" class="carousel-image">
                        <h3 class="carousel-title">{{ item.title }}</h3>
                      </el-carousel-item>
                    </el-carousel>
                  </template>
                  <template v-else>
                    {{ section.title }}
                  </template>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'HomePage',

  data() {
    // 保持数据不变
    return {
      activeIndex: '/home',  // 修改初始值为当前路由路径
      sections: [
        { title: '景点图片展示区域', class: 'scenic-spots' },
        { title: '智能推荐区域', class: 'smart-recommend' },
        { title: '特色美食区域', class: 'special-food' },
        { title: '用户互动区域', class: 'user-interaction' }
      ],
      carouselImages: [
        { id: 1, url: require('@/assets/大明寺（首页）.png'), title: '大明寺' },
        { id: 2, url: require('@/assets/个园（首页）.png'), title: '个园' },
        { id: 3, url: require('@/assets/何园（首页）.png'), title: '何园' },
        { id: 4, url: require('@/assets/瘦西湖（首页）.png'), title: '瘦西湖' }
      ]
    };
  },

  methods: {
    handleSelect(key) {
      this.$router.push(key);  // 使用 Vue Router 进行页面跳转
    }
  }
  // 删除 mounted 和 beforeDestroy 生命周期钩子
};
</script>

<style scoped>
/* 修改容器背景色 */
.el-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: transparent;
  /* 将背景改为透明 */
  box-shadow: none;
  /* 移除阴影效果 */
}

.el-main {
  background-color: transparent;
  /* 改为透明背景，让动态背景显示出来 */
  padding: 20px;
  line-height: normal;
  flex: 1;
  overflow-y: auto;
  /* 只在主内容区域添加滚动 */
}

.box {
  position: relative;
}

.banner {
  z-index: 999;
  position: absolute;
  top: 300%;
  left: 10%;
  color: #967171;
}

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

/* 内容区域样式 */
.content-section {
  /* 这是四个主要内容区域（景点、推荐、美食、互动）的基础样式，确保每个区域有足够的高度和适当的间距。 */
  margin: 0 0 20px 0;
  height: 60vh;
  /* 高度设为视窗高度的60% */
  width: 80vw;
  /* 设置宽度为视窗宽度的80% */
}

.section-container {
  padding: 0px;
  /* 增加内边距 */
  background-color: #7e4f4f;
  border-radius: 30px;
  box-shadow: 0 2px 12px 0 rgba(255, 255, 255, 0.1);
  height: 100%;
  /* 确保容器填充整个高度 */
  width: 100%;
  /* 填充父容器宽度 */
}

/* 各区域特定样式 */
.scenic-spots .section-container {
  background-color: transparent;
}

.smart-recommend .section-container {
  background-color: #f8f8f8;
}

.special-food .section-container {
  background-color: #f6f6f6;
}

.user-interaction .section-container {
  background-color: #f8f8f8;
}

/* 添加点击时的样式 */
.custom-menu>.el-menu-item:active {
  color: var(--menu-click-text) !important;
  transform: scale(1.5);
  transition: all 0.1s ease;
}


/* 添加轮播图相关样式 */
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
}

/* 修改景点字体 */
.carousel-title {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  background-color: transparent;
  padding: 10px 20px;
  border-radius: 5px;
  font-family: "楷体", "KaiTi", serif;
  /* 修改为楷体 */
  font-size: 20px;
  /* 设置字体大小 */
  font-weight: bold;
  /* 设置字体粗细 */
}

/* 修改轮播图卡片样式 */
.el-carousel__item {
  border-radius: 15px;
  overflow: hidden;

}

.el-carousel__item:hover {
  transform: scale(1.02);
  transition: all 0.3s ease;
}
</style>
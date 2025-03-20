<template>
  <div>
    <!-- 菜单栏保持不变 -->
    <el-menu :default-active="'/food'" class="custom-menu" mode="horizontal" router>
      <el-menu-item index="/home">首页</el-menu-item>
      <el-menu-item index="/recommend">推荐</el-menu-item>
      <el-menu-item index="/routes">路线</el-menu-item>
      <el-menu-item index="/food">美食</el-menu-item>
      <el-menu-item index="/account">账号</el-menu-item>
    </el-menu>

    <div class="food-container">
      <!-- 搜索框 -->
      <el-card class="search-box">
        <el-input
          v-model="keyword"
          placeholder="搜索扬州美食"
          class="search-input">
          <el-button slot="append" icon="el-icon-search" @click="searchFood">搜索</el-button>
        </el-input>
      </el-card>
      
      <!-- 添加排序选项 -->
      <el-radio-group v-model="sortType" @change="handleSort" class="sort-group">
        <el-radio-button label="default">默认排序</el-radio-button>
        <el-radio-button label="distance">距离最近</el-radio-button>
        <el-radio-button label="rating">评分最高</el-radio-button>
      </el-radio-group>

      <!-- 店铺列表 -->
      <div class="shop-list">
        <el-card v-for="shop in shops" :key="shop.id" class="shop-card">
          <!-- 店铺列表部分的修改 -->
          <div class="shop-content">
            <img :src="shop.image || require('@/assets/default-food.jpg')" class="shop-image">
            <div class="shop-info">
              <div class="shop-header">
                <h2 class="shop-name">{{ shop.name }}</h2>
                <el-button 
                  type="primary" 
                  size="small" 
                  class="go-btn"
                  @click="goToShop(shop)">
                  <i class="el-icon-position"></i> 去这里
                </el-button>
              </div>
              <p class="shop-type">{{ shop.type }}</p>
              <p class="shop-rating">评分：{{ shop.rating || '暂无' }}</p>
              <p class="shop-address">
                <i class="el-icon-location"></i>
                {{ shop.address }}
              </p>
              <p class="shop-distance">距离：{{ (shop.distance/1000).toFixed(1) }}km</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodPage',
  data() {
    return {
      sortType: 'default',
      keyword: '',
      shops: [],
      location: null,
      webApiKey: 'e31ba28c742cd588b5c86be3937449ab'
    }
  },
  mounted() {
    this.getCurrentLocation()
  },
  methods: {
    async getCurrentLocation() {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        
        this.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        
        // 获取位置后立即搜索附近餐厅
        this.searchFood()
      } catch (error) {
        this.$message.warning('获取位置失败，将使用扬州市中心坐标')
        this.location = {
          latitude: 32.393159,
          longitude: 119.421003
        }
        // 使用默认位置搜索
        this.searchFood()
      }
    },

    async searchFood() {
      try {
        const response = await fetch(
          `https://restapi.amap.com/v3/place/around?key=${this.webApiKey}&location=${this.location.longitude},${this.location.latitude}&keywords=${this.keyword || '餐饮'}&types=050000&radius=8000&offset=30&page=1&extensions=all`
        )
        const data = await response.json()
        
        if (data.status === '1' && data.pois) {
          this.shops = data.pois.map(poi => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            type: poi.type.split(';')[0],
            distance: Number(poi.distance),
            rating: poi.biz_ext ? Number(poi.biz_ext.rating) || 0 : 0,
            image: poi.photos && poi.photos[0] ? poi.photos[0].url : null,
            location: poi.location  // 添加位置信息
          }))
          this.handleSort(this.sortType)
        }
      } catch (error) {
        this.$message.error('获取餐厅信息失败')
      }
    },

    handleSort(type) {
      switch (type) {
        case 'distance':
          this.shops.sort((a, b) => a.distance - b.distance)
          break
        case 'rating':
          this.shops.sort((a, b) => b.rating - a.rating)
          break
        default:
          // 默认排序，保持原有顺序
          break
      }
    },
    goToShop(shop) {
      const navigationParams = {
        startLat: this.location.latitude,
        startLng: this.location.longitude,
        endLat: shop.location?.split(',')[1] || '',  // 目的地纬度
        endLng: shop.location?.split(',')[0] || '',  // 目的地经度
        endName: shop.name,                          // 目的地名称
        endAddress: shop.address                     // 目的地地址
      }
      
      this.$router.push({
        path: '/food/navigation',
        query: navigationParams
      })
    }
  }
}

</script>
<style scoped>
/* 保持原有的菜单栏样式 */
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

/* 菜单项样式 */
.el-menu>.el-menu-item,
.el-menu>.el-submenu {
  flex: 1;
  font-family: "华文中宋", "STZhongsong", sans-serif;
  font-size: 23px;
  max-width: 15%;
  text-align: center;
  transition: all 0.3s ease !important;
  background-color: transparent !important;
  color: var(--menu-text) !important;
}

/* 悬停效果 */
.custom-menu>.el-menu-item:hover {
  background-color: transparent !important;
  display: inline-block;
  transform: scale(1.4);
  transition: transform 0.3s ease;
  color: var(--menu-hover-text) !important;
}

/* 激活状态 */
.custom-menu>.el-menu-item.is-active {
  border-bottom: transparent !important;
  font-size: 24px;
  transform: scale(1.5);
  color: var(--menu-active-text) !important;
}

/* 新增样式 */
.food-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shop-card {
  transition: transform 0.3s;
}

.shop-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.shop-content {
  display: flex;
  gap: 20px;
}

.shop-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.shop-info {
  flex: 1;
}

.shop-name {
  margin: 0 0 10px;
  color: #333;
  font-size: 20px;
}

.shop-type {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.shop-address {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.shop-distance {
  color: #409EFF;
  font-size: 14px;
  margin: 5px 0;
}
shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.go-btn {
  white-space: nowrap;
}

.go-btn i {
  margin-right: 3px;
}
</style>

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

    <div class="navigation-container">
      <!-- 路线规划控制面板 -->
      <el-card class="control-panel">
        <!-- 显示目的地信息 -->
        <div class="destination-info">
          <h3>目的地：{{ destinationName }}</h3>
          <p>地址：{{ destinationAddress }}</p>
        </div>
        <!-- 路线规划选项 -->
        <div class="route-options">
          <el-form label-width="80px">
            <el-form-item label="出发地">
              <el-input v-model="startLocation" placeholder="请输入起点"></el-input>
            </el-form-item>
            <el-form-item label="交通方式">
              <el-radio-group v-model="travelMode">
                <el-radio label="driving">驾车</el-radio>
                <el-radio label="walking">步行</el-radio>
                <el-radio label="transit">公交</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="planRoute">规划路线</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <!-- 地图容器 -->
      <div id="container" class="map-container"></div>
    </div>
  </div>
</template>

<script>
import MapService from '@/services/MapService'

export default {
  name: 'FoodNavigation',
  data() {
    return {
      map: null,
      destinationName: '',
      destinationAddress: '',
      startLocation: '',
      travelMode: 'driving',
      distance: 0,
      duration: 0,
      currentRoute: null,
      webApiKey: 'e31ba28c742cd588b5c86be3937449ab',
      jsApiKey: 'f1ca4a456107342d1648dbd59bfb9a0f'
    }
  },

  // 添加以下生命周期钩子和监听器
  // 删除这些生命周期钩子
  // beforeDestroy() {
  //   if (this.map) {
  //     this.map.destroy()
  //     this.map = null
  //   }
  //   if (window.AMap) {
  //     window.AMap = undefined
  //   }
  // },

  // beforeRouteUpdate() {
  //   if (this.map) {
  //     this.map.destroy()
  //     this.map = null
  //   }
  //   if (window.AMap) {
  //     window.AMap = undefined
  //   }
  // },

  watch: {
    // 监听路由参数变化
    '$route.query': {
      immediate: true,  // 立即执行一次
      async handler(newQuery) {
        if (newQuery.endName && newQuery.endAddress) {
          this.destinationName = newQuery.endName
          this.destinationAddress = newQuery.endAddress
          await this.initMap()
        }
      }
    }
  },

  // 移除原来的 mounted 钩子中的初始化逻辑
  async mounted() {
    // 不需要在这里初始化地图，watch 会处理
  },
  methods: {
    async getCoordinates(address) {
      try {
        const response = await fetch(`https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${this.webApiKey}&city=扬州市`)
        const data = await response.json()

        if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
          const [lng, lat] = data.geocodes[0].location.split(',')
          return [parseFloat(lng), parseFloat(lat)]
        }
        return null
      } catch (error) {
        console.error('获取经纬度失败:', error)
        return null
      }
    },

    async initMap() {
      try {
        const AMap = await MapService.initAMap()

        this.map = new AMap.Map('container', {
          zoom: 11,
          center: [119.421003, 32.393159]
        })

        // 添加定位插件
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          buttonPosition: 'RB',
          buttonOffset: new AMap.Pixel(10, 20),
          zoomToAccuracy: true
        })

        this.map.addControl(geolocation)

        // 获取当前位置
        geolocation.getCurrentPosition(async (status, result) => {
          if (status === 'complete' && result.position) {
            const lnglat = [result.position.lng, result.position.lat]
            try {
              const response = await fetch(`https://restapi.amap.com/v3/geocode/regeo?location=${lnglat.join(',')}&key=${this.webApiKey}`)
              const data = await response.json()

              if (data.status === '1' && data.regeocode) {
                this.startLocation = data.regeocode.formatted_address
                // 添加当前位置标记
                new AMap.Marker({
                  map: this.map,
                  position: lnglat,
                  title: '当前位置'
                })
                // 自动规划路线
                this.planRoute()
              }
            } catch (error) {
              this.$message.warning('获取地址失败，请手动输入起点')
            }
          } else {
            this.$message.warning('定位失败，请手动输入起点')
          }
        })

        // 添加目的地标记
        const endCoords = await this.getCoordinates(this.destinationAddress)
        if (endCoords) {
          new AMap.Marker({
            map: this.map,
            position: endCoords,
            title: this.destinationName
          })
        }
      } catch (error) {
        console.error('地图初始化失败:', error)
        this.$message.error('地图加载失败')
      }
    },

    async planRoute() {
      if (this.currentRoute) {
        this.map.remove(this.currentRoute)
      }

      const startCoords = await this.getCoordinates(this.startLocation)
      const endCoords = await this.getCoordinates(this.destinationAddress)

      if (!startCoords || !endCoords) {
        this.$message.error('地址解析失败，请检查地址是否正确')
        return
      }

      try {
        const routeType = {
          driving: 'driving',
          walking: 'walking',
          transit: 'transit/integrated'
        }[this.travelMode]

        let url = `https://restapi.amap.com/v3/direction/${routeType}?` +
          `origin=${startCoords.join(',')}&` +
          `destination=${endCoords.join(',')}&` +
          `key=${this.webApiKey}`

        if (this.travelMode === 'transit') {
          url += '&city=扬州&cityd=扬州'
        }

        const response = await fetch(url)
        const data = await response.json()

        if (data.status === '1') {
          const polyline = []
          if (this.travelMode === 'transit') {
            data.route.transits[0].segments.forEach(segment => {
              if (segment.walking && segment.walking.steps) {
                segment.walking.steps.forEach(step => {
                  const points = step.polyline.split(';')
                  points.forEach(point => {
                    const [lng, lat] = point.split(',')
                    polyline.push([parseFloat(lng), parseFloat(lat)])
                  })
                })
              }
              if (segment.bus && segment.bus.buslines && segment.bus.buslines[0]) {
                const points = segment.bus.buslines[0].polyline.split(';')
                points.forEach(point => {
                  const [lng, lat] = point.split(',')
                  polyline.push([parseFloat(lng), parseFloat(lat)])
                })
              }
            })
          } else {
            data.route.paths[0].steps.forEach(step => {
              const points = step.polyline.split(';')
              points.forEach(point => {
                const [lng, lat] = point.split(',')
                polyline.push([parseFloat(lng), parseFloat(lat)])
              })
            })
          }

          const routeLine = new AMap.Polyline({
            path: polyline,
            strokeColor: '#3366FF',
            strokeWeight: 6,
            strokeOpacity: 0.8
          })

          this.map.add(routeLine)
          this.currentRoute = routeLine
          this.map.setFitView([routeLine])

          // 更新消息提示的持续时间为 2 秒
          this.$message({
            message: '路线规划成功',
            type: 'success',
            duration: 1000  // 1秒后自动关闭
          })
        }
      } catch (error) {
        console.error('路线规划失败：', error)
        this.$message.error('路线规划失败，请稍后重试')
      }
    }
  }
}
</script>

<style scoped>
/* 菜单栏样式 */
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

/* 其他现有样式保持不变 */
.navigation-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
}

.control-panel {
  width: 100%;
  max-width: 300px;
  margin-right: 20px;
}

.destination-info {
  margin-bottom: 20px;
}

.map-container {
  height: 500px;
  border-radius: 4px;
  overflow: hidden;
}

.route-options {
  margin-top: 20px;
}

@media (min-width: 768px) {
  .navigation-container {
    flex-direction: row;
  }
  
  .map-container {
    flex: 1;
  }
}
</style>
<template>
    <div>
        <!-- 菜单栏 -->
        <el-menu :default-active="'/routes'" class="custom-menu" mode="horizontal" router>
            <el-menu-item index="/home">首页</el-menu-item>
            <el-menu-item index="/recommend">推荐</el-menu-item>
            <el-menu-item index="/routes">路线</el-menu-item>
            <el-menu-item index="/food">美食</el-menu-item>
            <el-menu-item index="/account">账号</el-menu-item>
        </el-menu>

        <div>
            <!-- 切换按钮 -->
            <el-button-group class="switch-buttons">
                <el-button :type="activeView === 'details' ? 'primary' : 'default'" @click="switchView('details')">
                    景点详情
                </el-button>
                <el-button :type="activeView === 'route' ? 'primary' : 'default'" @click="switchView('route')">
                    景点路线
                </el-button>
            </el-button-group>

            <!-- 内容容器 -->
            <div class="content-container">
                <!-- 路线规划内容 -->
                <div v-if="activeView === 'route'" class="route-content">
                    <div class="route-container">
                        <!-- 路线规划控制面板 -->
                        <el-card class="control-panel">
                            <!-- 显示选中景点信息 -->
                            <div class="destination-info" v-if="selectedSpot">
                                <h3>目的地：{{ selectedSpot.attractionName }}</h3>
                                <p>地址：{{ selectedSpot.attractionLocal }}</p>
                            </div>
                            <!-- 路线规划选项 -->
                            <div class="route-options">
                                <el-form label-width="80px">
                                    <el-form-item label="出发地">
                                        <!-- 出发地输入 -->
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
                <!-- 景点详情内容 -->
                <div v-else class="details-content">
                    <div v-if="selectedSpot" class="spot-details">
                        <!-- 图片轮播 -->
                        <el-carousel height="400px" class="spot-carousel">
                            <el-carousel-item v-for="(url, index) in selectedSpot.imageUrls" :key="index">
                                <img :src="url" class="carousel-image">
                            </el-carousel-item>
                        </el-carousel>

                        <!-- 景点信息 -->
                        <div class="spot-info">
                            <h2>{{ selectedSpot.attractionName }}</h2>
                            <div class="spot-tags">
                                <el-tag size="small" type="success">{{ selectedSpot.classify }}</el-tag>
                                <el-tag size="small" type="warning">￥{{ selectedSpot.attractionPrice }}</el-tag>
                                <el-tag size="small" type="info">{{ selectedSpot.travelTime }}小时</el-tag>
                            </div>
                            <div class="spot-labels">
                                <el-tag size="small" v-for="(label, index) in selectedSpot.label.split(',')"
                                    :key="index" effect="plain" style="margin: 5px;">
                                    {{ label }}
                                </el-tag>
                            </div>
                            <p class="spot-address">
                                <i class="el-icon-location"></i> {{ selectedSpot.attractionLocal }}
                            </p>
                            <div class="spot-description">
                                {{ selectedSpot.attractionDescription }}
                            </div>
                            <!-- 引入评论组件 -->
                            <!-- 修改评论组件的使用 -->
                            <comment-section 
                                v-if="selectedSpot && selectedSpot.attractionId" 
                                :attractionId="Number(selectedSpot.attractionId)"
                            ></comment-section>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import axios from 'axios'
import CommentSection from '@/components/CommentSection.vue'

export default {
    name: 'RoutesPlan',
    components: {
        CommentSection
    },
    props: {
        id: {
            type: String,
            required: false
        }
    },
    data() {
        return {
            map: null,
            selectedSpot: null,
            startLocation: '',
            travelMode: 'driving',
            webApiKey: 'e31ba28c742cd588b5c86be3937449ab',
            jsApiKey: 'f1ca4a456107342d1648dbd59bfb9a0f',  // 添加 JS API key
            currentRoute: null,  // 添加当前路线对象
            activeView: 'details', // 默认显示路线规划视图
        }
    },
    async mounted() {
        try {
            // 如果有路由参数，优先从后端获取数据
            const spotId = this.$route.params.id
            if (spotId) {
                const response = await axios.post(`/api/spots/attractions/${spotId}`)
                console.log('从后端加载数据:', response.data)
                if (response.data.code === 1) {
                    this.selectedSpot = response.data.data
                    // 更新本地存储
                    localStorage.setItem('selectedSpot', JSON.stringify(this.selectedSpot))
                }
            } else {
                // 如果没有路由参数，尝试从 localStorage 获取数据
                const spotStr = localStorage.getItem('selectedSpot')
                if (spotStr) {
                    this.selectedSpot = JSON.parse(spotStr)
                    console.log('从 localStorage 加载数据:', this.selectedSpot)
                }
            }

            if (this.activeView === 'route') {
                this.initMap()
            }
        } catch (error) {
            console.error('获取景点信息失败:', error)
            this.$message.error('获取景点信息失败')
        }
    },
    methods: {
        // 添加获取经纬度的方法
        async getCoordinates(address) {
            try {
                const response = await fetch(`https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${this.webApiKey}&city=扬州市`)
                const data = await response.json()

                if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
                    const [lng, lat] = data.geocodes[0].location.split(',')
                    return [parseFloat(lng), parseFloat(lat)]
                } else {
                    console.error('地理编码失败:', data)
                    return null
                }
            } catch (error) {
                console.error('获取经纬度失败:', error)
                return null
            }
        },

        switchView(view) {
            this.activeView = view
            if (view === 'details' && this.selectedSpot) {
                // 如果切换到详情视图，销毁地图实例
                if (this.map) {
                    this.map.destroy()
                    this.map = null
                }
                console.log('加载景点详情:', this.selectedSpot.attractionName)
            }
            else if (view === 'route') {
                // 再初始化地图
                this.initMap()
            }
        },

        async initMap() {
            try {
                const AMap = await AMapLoader.load({
                    key: this.jsApiKey,
                    version: '2.0',
                    plugins: ['AMap.Geolocation'], // 只保留定位插件，因为代码中使用了 AMap.Geolocation
                    security: {
                        securityCode: '5c14642302a2398d4796c6a2509d2c6f'  // 替换为你的安全密钥
                    }
                })

                window.AMap = AMap
                console.log('地图加载成功')

                this.map = new AMap.Map('container', {
                    zoom: 11,
                    center: [119.421003, 32.393159]
                })

                // 添加定位插件
                const geolocation = new AMap.Geolocation({
                    // 启用高精度定位模式，会使用GPS等更精确的定位方式
                    enableHighAccuracy: true,

                    // 定位超时时间，单位毫秒，超过这个时间还没定位成功就会返回超时错误
                    timeout: 10000,

                    // 定位按钮的位置，'RB'表示右下角（Right Bottom）
                    buttonPosition: 'RB',

                    // 定位按钮距离地图右下角的偏移量，使用Pixel对象设置x和y的偏移像素
                    buttonOffset: new AMap.Pixel(10, 20),

                    // 定位成功后是否自动调整地图视野到定位点
                    zoomToAccuracy: true
                })

                this.map.addControl(geolocation)

                // 获取当前位置
                geolocation.getCurrentPosition(async (status, result) => {
                    console.log('定位状态:', status)
                    console.log('定位结果:', result)

                    if (status === 'complete' && result.position) {
                        // 从 position 对象中获取经纬度
                        const lnglat = [result.position.lng, result.position.lat]

                        try {
                            // 使用 Web API 进行逆地理编码
                            const response = await fetch(`https://restapi.amap.com/v3/geocode/regeo?location=${lnglat.join(',')}&key=${this.webApiKey}`)
                            const data = await response.json()

                            if (data.status === '1' && data.regeocode) {
                                const address = data.regeocode.formatted_address
                                console.log('获取到的地址:', address)
                                // 将地址设置为起点位置
                                this.startLocation = address

                                // 添加当前位置标记
                                new AMap.Marker({
                                    map: this.map,
                                    position: lnglat,
                                    title: '当前位置',
                                    icon: new AMap.Icon({
                                        size: new AMap.Size(25, 34),
                                        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
                                        imageSize: new AMap.Size(25, 34)
                                    })
                                })
                                // 如果已选择目的地，自动规划路线
                                if (this.selectedSpot) {
                                    this.planRoute()
                                }
                            } else {
                                throw new Error('逆地理编码失败')
                            }
                        } catch (error) {
                            console.error('获取地址失败:', error)
                            this.$message.warning('获取地址失败，请手动输入起点')
                        }
                    } else {
                        console.error('定位失败:', result)
                        this.$message.warning('定位失败，请手动输入起点')
                    }
                })

                // 继续处理目的地标记
                // 检查是否有选中的景点
                if (this.selectedSpot) {
                    console.log('选中的景点信息:', this.selectedSpot)

                    // 使用 Web 服务 API 获取经纬度
                    let coords = await this.getCoordinates(this.selectedSpot.attractionLocal)
                    if (!coords) {
                        // 如果获取失败，使用默认坐标
                        const defaultCoords = {
                            // 这里可以添加景点的默认坐标
                        }
                        coords = defaultCoords[this.selectedSpot.attractionName] || [119.421003, 32.393159]
                    }

                    // 添加标记
                    new AMap.Marker({
                        map: this.map,
                        position: coords,
                        title: this.selectedSpot.attractionName
                    })

                    // 设置地图中心点
                    this.map.setCenter(coords)
                    this.map.setZoom(13)
                }
            } catch (error) {
                console.error('地图初始化失败:', error)
                this.$message.error('地图加载失败')
            }
        },

        async planRoute() {
            // 清除之前的路线
            if (this.currentRoute) {
                this.map.remove(this.currentRoute)
            }

            // 获取起点和终点的经纬度
            const startCoords = await this.getCoordinates(this.startLocation)
            const endCoords = await this.getCoordinates(this.selectedSpot.attractionLocal)

            if (!startCoords || !endCoords) {
                this.$message.error('地址解析失败，请检查地址是否正确')
                return
            }

            try {
                // 根据交通方式选择对应的 API
                const routeType = {
                    driving: 'driving',
                    walking: 'walking',
                    transit: 'transit/integrated'  // 修改为集成公交路线规划
                }[this.travelMode]

                // 构建请求 URL
                let url = `https://restapi.amap.com/v3/direction/${routeType}?` +
                    `origin=${startCoords.join(',')}&` +
                    `destination=${endCoords.join(',')}&` +
                    `key=${this.webApiKey}`

                // 如果是公交路线，添加城市参数
                if (this.travelMode === 'transit') {
                    url += '&city=扬州&cityd=扬州'
                }

                const response = await fetch(url)
                const data = await response.json()

                if (data.status === '1') {
                    // 绘制路线
                    const polyline = []

                    if (this.travelMode === 'transit') {
                        // 处理公交路线
                        data.route.transits[0].segments.forEach(segment => {
                            // 处理步行段
                            if (segment.walking && segment.walking.steps) {
                                segment.walking.steps.forEach(step => {
                                    const points = step.polyline.split(';')
                                    points.forEach(point => {
                                        const [lng, lat] = point.split(',')
                                        polyline.push([parseFloat(lng), parseFloat(lat)])
                                    })
                                })
                            }
                            // 处理公交段
                            if (segment.bus && segment.bus.buslines && segment.bus.buslines[0]) {
                                const points = segment.bus.buslines[0].polyline.split(';')
                                points.forEach(point => {
                                    const [lng, lat] = point.split(',')
                                    polyline.push([parseFloat(lng), parseFloat(lat)])
                                })
                            }
                        })
                    } else {
                        // 处理驾车和步行路线
                        data.route.paths[0].steps.forEach(step => {
                            const points = step.polyline.split(';')
                            points.forEach(point => {
                                const [lng, lat] = point.split(',')
                                polyline.push([parseFloat(lng), parseFloat(lat)])
                            })
                        })
                    }

                    // 创建路线图层
                    const routeLine = new window.AMap.Polyline({
                        path: polyline,
                        strokeColor: '#3366FF',
                        strokeWeight: 6,
                        strokeOpacity: 0.8
                    })
                    // 将路线添加到地图上
                    this.map.add(routeLine)
                    // 保存当前路线对象，方便后续清除
                    this.currentRoute = routeLine
                    // 调整地图视野，确保路线完整显示在可视区域内
                    this.map.setFitView([routeLine])
                    // 显示成功提示
                    this.$message.success('路线规划成功')
                } else {
                    throw new Error(data.info || '路线规划失败')
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
/* 复用菜单栏样式 */
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

/* 菜单项通用样式 */
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

/* 悬停效果设置 */
.custom-menu>.el-menu-item:hover {
    background-color: transparent !important;
    display: inline-block;
    transform: scale(1.4);
    transition: transform 0.3s ease;
    color: var(--menu-hover-text) !important;
}

.switch-buttons {
    margin: 20px;
    display: flex;
    justify-content: center;
}

.content-container {
    margin: 0 20px;
}

.route-content,
.details-content {
    background-color: #fff;
    border-radius: 4px;
    padding: 20px;
}

/* 确保路线容器样式不变 */
.route-container {
    display: flex;
    padding: 20px;
    gap: 20px;
    height: calc(100vh - 180px);
    /* 调整高度以适应新增的按钮 */
}

/* 保持激活状态样式 */
.custom-menu>.el-menu-item.is-active {
    border-bottom: transparent !important;
    font-size: 24px;
    transform: scale(1.5);
    color: var(--menu-active-text) !important;
}

/* 其他现有样式保持不变 */
.route-container {
    display: flex;
    padding: 20px;
    gap: 20px;
    height: calc(100vh - 100px);
}

.control-panel {
    width: 300px;
}

.map-container {
    flex: 1;
    min-height: 500px;
    border-radius: 4px;
    overflow: hidden;
}

.spot-details {
    padding: 20px;
}

.spot-carousel {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.spot-info {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.spot-tags {
    margin: 15px 0;
}

.spot-tags .el-tag {
    margin-right: 10px;
}

.spot-labels {
    margin: 15px 0;
}

.spot-address {
    color: #666;
    margin: 15px 0;
}

.spot-description {
    line-height: 1.8;
    color: #333;
    margin-top: 15px;
}
</style>
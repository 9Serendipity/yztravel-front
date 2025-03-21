import AMapLoader from '@amap/amap-jsapi-loader'

class MapService {
    static instance = null
    static AMap = null
    static jsApiKey = 'f1ca4a456107342d1648dbd59bfb9a0f'
    static webApiKey = 'e31ba28c742cd588b5c86be3937449ab'

    static async initAMap() {
        if (!this.AMap) {
            try {
                this.AMap = await AMapLoader.load({
                    key: this.jsApiKey,
                    version: '2.0',
                    plugins: ['AMap.Geolocation'],
                    security: {
                        securityCode: '5c14642302a2398d4796c6a2509d2c6f'
                    }
                })
            } catch (error) {
                console.error('地图初始化失败:', error)
                throw error
            }
        }
        return this.AMap
    }

    static async getCoordinates(address) {
        try {
            const response = await fetch(
                `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${this.webApiKey}&city=扬州市`
            )
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
    }
}

export default MapService
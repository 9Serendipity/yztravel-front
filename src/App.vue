<template>
  <div id="app">
 <router-view/>
   
  </div>
</template>
<script>
import MapService from '@/services/MapService'

export default {
    name: 'App',
    async created() {
        try {
            await MapService.initAMap()
        } catch (error) {
            console.error('地图服务初始化失败')
        }
    }
}
</script>
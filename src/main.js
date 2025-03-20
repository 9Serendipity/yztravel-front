import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

Vue.config.productionTip = false
Vue.use(ElementUI)

// 配置 axios
axios.defaults.baseURL = 'http://localhost:7000'  // 设置为前端地址

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
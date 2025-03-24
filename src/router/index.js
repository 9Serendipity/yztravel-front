import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RecommendSpots from '@/views/RecommendSpots.vue'
import Routes from '@/views/Routes.vue'
import RoutesBefore from '@/views/RoutesBefore.vue'
import AccountManage from '@/views/AccountManage.vue'
import FoodPage from '@/views/Food.vue'  // 修改导入名称
import FoodNavigation from '@/views/FoodNavigation.vue'  // 添加新组件导入
import AdminSpots from '@/views/AdminSpots.vue'

// 解决重复导航的问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') throw err
  })
}

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'  // 修改这里，默认重定向到登录页
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/recommend',
    name: 'RecommendSpots',
    component: RecommendSpots,
    meta: { requiresAuth: true }
  },
  {
    path: '/routes/:id',
    name: 'Routes',
    component: Routes,
    meta: { requiresAuth: true }
  },
  {
    path: '/account',
    name: 'AccountManage',
    component: AccountManage,
    meta: { requiresAuth: true }
  },
  {
    path: '/routes',
    name: 'RoutesBefore',
    component: RoutesBefore,
    meta: { requiresAuth: true }
  },
  {
    path: '/food',
    name: 'FoodPage',    // 修改路由名称
    component: FoodPage, // 修改组件引用
    meta: { requiresAuth: true }
  },
  {
    path: '/food/navigation',
    name: 'FoodNavigation',
    component: FoodNavigation,
    props: (route) => ({
        startLat: route.query.startLat,
        startLng: route.query.startLng,
        endLat: route.query.endLat,
        endLng: route.query.endLng,
        endName: route.query.endName,
        endAddress: route.query.endAddress
    }),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminSpots',
    component: AdminSpots,
  }
]

const router = new VueRouter({
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/home']
  const authRequired = !publicPages.includes(to.path)
  const user = localStorage.getItem('user')

  if (authRequired && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router
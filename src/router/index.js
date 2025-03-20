import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RecommendSpots from '@/views/RecommendSpots.vue'
import Routes from '@/views/Routes.vue'
import RoutesBefore from '@/views/RoutesBefore.vue'
import AccountManage from '@/views/AccountManage.vue'

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
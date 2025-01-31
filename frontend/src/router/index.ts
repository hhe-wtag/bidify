import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegistrationView from '@/views/RegistrationView.vue'
import ItemsView from '@/views/ItemsView.vue'
import { useUserStore } from '@/stores/user'
import BaseProfile from '@/views/Profile/BaseProfile.vue'
import EditProfile from '@/views/Profile/EditProfile.vue'
import ProfileView from '@/views/Profile/ProfileView.vue'
import ChangePassword from '@/views/Profile/ChangePassword.vue'
import NotificationView from '@/views/NotificationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: RegistrationView,
      meta: { requiresAuth: false },
    },
    {
      path: '/profile',
      component: BaseProfile,
      children: [
        {
          path: '',
          name: 'profile',
          component: ProfileView,
          meta: { requiresAuth: true },
        },
        {
          path: 'update',
          name: 'update-profile',
          component: EditProfile,
          meta: { requiresAuth: true },
        },
        {
          path: 'change-password',
          name: 'change-password',
          component: ChangePassword,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/items',
      name: 'items',
      component: ItemsView,
      meta: { requiresAuth: false },
    },
    {
      path: '/notification',
      name: 'notification',
      component: NotificationView,
      meta: { requiresAuth: true },
    },
    {
      path: '/items/:slug',
      component: () => import('@/components/items/ItemDetails.vue'),
    },
    {
      path: '/user-enlisted-items',
      component: () => import('@/views/UserEnlistedItems.vue'),
    },
    {
      path: '/user-winning-items',
      component: () => import('@/views/UserWinningItems.vue'),
    }
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = !!userStore.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    next('/profile')
    return
  }

  next()
})

export default router

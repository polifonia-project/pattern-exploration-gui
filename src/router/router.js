import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/HomeSearchPage.vue'
import Composition from '../components/CompositionPage.vue'

const routes = [
  {
    path: '/',
    name: 'HomeSearchPage',
    component: Home
  },
  {
    path: '/composition/:id',
    name: 'CompositionPage',
    component: Composition
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
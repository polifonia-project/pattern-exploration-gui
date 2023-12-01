import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/HomeSearchPage.vue'
import Composition from '../components/CompositionPage.vue'
import Pattern from '../components/PatternPage.vue'
import TuneFamily from '../components/TuneFamilyPage.vue'

const routes = [
  {
    path: '/',
    name: 'HomeSearchPage',
    component: Home
  },
  {
    path: '/composition/:id/:prev?',
    name: 'CompositionPage',
    component: Composition,
    props: true
  },
  {
    path: '/pattern/:pattern',
    name: 'PatternPage',
    component: Pattern,
    props: true
  },
  {
    path: '/family/:fam',
    name: 'TuneFamilyPage',
    component: TuneFamily,
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
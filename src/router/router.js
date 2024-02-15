import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/HomeSearchPage.vue'
import Composition from '../components/CompositionPage.vue'
import Pattern from '../components/PatternPage.vue'
import TuneFamily from '../components/TuneFamilyPage.vue'
import AboutPage from '../components/AboutPage.vue'
import sampleSPARQLQueries from '../components/sampleSPARQLQueries.vue'

const routes = [
  {
    path: '/',
    name: 'HomeSearchPage',
    component: Home
  },
  {
    path: '/composition/:id/:prev?/:prevTitle?',
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
  {
    path: '/about',
    name: 'AboutPage',
    component: AboutPage,
    props: false
  },
  {
    path: '/queries',
    name: 'sampleSPARQLQueries',
    component: sampleSPARQLQueries,
    props: false
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

export default router
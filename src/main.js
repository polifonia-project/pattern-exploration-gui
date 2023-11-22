import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import "bootstrap/dist/css/bootstrap.min.css";
import bootstrap from "bootstrap/dist/js/bootstrap.js"

createApp(App).use(router).use(bootstrap).mount('#app')

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/index.css'

console.log('Main.ts loaded, router:', router)

const app = createApp(App)

app.use(router)

app.mount('#app')


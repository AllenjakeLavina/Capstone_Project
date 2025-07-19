import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles.css' // Will create this CSS file later if needed
import './registerServiceWorker'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Add Font Awesome from CDN
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
document.head.appendChild(link)

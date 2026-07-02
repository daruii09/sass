import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import QAsset from './components/QAsset.vue'
import './styles/global.css'

const app = createApp(App)
app.component('QAsset', QAsset)   // 全局 Q 版美术素材组件（含失败回退）
app.use(createPinia()).mount('#app')

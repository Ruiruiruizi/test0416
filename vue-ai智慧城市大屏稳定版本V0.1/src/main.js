import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'

const app = createApp(App)

// 全局注册 ECharts 组件
app.component('v-chart', VChart)

app.mount('#app')

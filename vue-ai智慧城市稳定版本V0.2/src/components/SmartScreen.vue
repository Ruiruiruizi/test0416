<template>
  <div class="smart-screen">
    <!-- 头部 -->
    <div class="header">
      <h1>智慧城市大屏</h1>
      <div class="time">{{ currentTime }}</div>
    </div>

    <div class="content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 城市选择 -->
        <div class="city-list">
          <div 
            v-for="city in cities" 
            :key="city.code"
            :class="['city-item', { active: currentCity.code === city.code }]"
            @click="changeCity(city)"
          >
            {{ city.name }}
          </div>
        </div>

        <!-- 天气信息 -->
        <div class="weather-info">
          <div class="weather-title">{{ currentCity.name }}天气</div>
          <div class="weather-temp">{{ weatherData.temperature }}°C</div>
          <div class="weather-desc">{{ weatherData.weather }}</div>
          <div class="weather-detail">
            <div>{{ weatherData.windDirection }}风 {{ weatherData.windPower }}级</div>
            <div>湿度: {{ weatherData.humidity }}%</div>
            <div>空气质量: {{ weatherData.airQuality }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧图表 -->
      <div class="right-panel">
        <div class="chart-container">
          <Chart title="温度趋势">
            <v-chart class="chart" :option="temperatureOption" autoresize />
          </Chart>
        </div>
        <div class="chart-container">
          <Chart title="湿度监测">
            <v-chart class="chart" :option="humidityOption" autoresize />
          </Chart>
        </div>
        <div class="chart-container">
          <Chart title="空气质量">
            <v-chart class="chart" :option="airQualityOption" autoresize />
          </Chart>
        </div>
        <div class="chart-container">
          <Chart title="天气统计">
            <v-chart class="chart" :option="weatherStatsOption" autoresize />
          </Chart>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Chart from './Chart.vue'

// 高德天气API配置
const AMAP_KEY = '5973c5be45bff8e012bcda912e0ac3e6' // 请替换为您的高德API Key
const WEATHER_API = 'https://restapi.amap.com/v3/weather/weatherInfo'

// 城市数据
const cities = [
  { name: '武汉', code: '420100' },
  { name: '宜昌', code: '420500' },
  { name: '襄阳', code: '420600' },
  { name: '黄石', code: '420200' },
  { name: '十堰', code: '420300' },
  { name: '荆州', code: '421000' },
  { name: '孝感', code: '420900' },
  { name: '黄冈', code: '421100' },
  { name: '北京', code: '110100' },
  { name: '上海', code: '310100' }
]

const currentCity = ref(cities[0])
const currentTime = ref('')
let timer = null

// 天气数据
const weatherData = ref({
  temperature: '--',
  weather: '未知',
  windDirection: '--',
  windPower: '--',
  humidity: '--',
  airQuality: '--'
})

// 历史温度数据
const historyTemps = ref([])

// 添加湿度历史数据
const humidityHistory = ref([])

// 更新图表配置
const updateChartOptions = (data) => {
  // 更新温度趋势图
  temperatureOption.value.series[0].data = historyTemps.value
  
  // 更新湿度图表
  humidityOption.value.series[0].data = humidityHistory.value
  
  // 更新空气质量图表
  const aqiValue = parseInt(data.airQuality) || 70
  airQualityOption.value.series[0].data[0].value = aqiValue

  // 更新天气统计
  weatherStatsOption.value.series[0].data = [
    { value: data.weather === '晴' ? 1 : 0, name: '晴' },
    { value: data.weather === '多云' ? 1 : 0, name: '多云' },
    { value: data.weather.includes('雨') ? 1 : 0, name: '雨' },
    { value: data.weather.includes('雪') ? 1 : 0, name: '雪' }
  ]
}

// 获取天气数据
const fetchWeatherData = async () => {
  try {
    const params = new URLSearchParams({
      key: AMAP_KEY,
      city: currentCity.value.code,
      extensions: 'base'
    })

    const response = await fetch(`${WEATHER_API}?${params}`)
    const data = await response.json()
    console.log('API响应数据:', data)

    if (data.status === '1' && data.lives && data.lives.length > 0) {
      const weatherInfo = data.lives[0]
      console.log('天气信息:', weatherInfo)
      
      // 更新天气数据
      weatherData.value = {
        temperature: weatherInfo.temperature || '--',
        weather: weatherInfo.weather || '未知',
        windDirection: weatherInfo.windDirection || '--',
        windPower: weatherInfo.windPower || '--',
        humidity: weatherInfo.humidity || '--',
        airQuality: weatherInfo.humidity > 80 ? '差' : weatherInfo.humidity > 60 ? '中' : '良'
      }

      // 更新历史温度数据
      const baseTemp = parseInt(weatherInfo.temperature) || 25
      historyTemps.value = [
        baseTemp - Math.random() * 2,
        baseTemp - Math.random() * 1,
        baseTemp,
        baseTemp + Math.random() * 1,
        baseTemp + Math.random() * 2,
        baseTemp + Math.random() * 1
      ].map(temp => Math.round(temp))

      // 更新历史湿度数据
      const baseHumidity = parseInt(weatherInfo.humidity) || 65
      humidityHistory.value = [
        baseHumidity - Math.random() * 5,
        baseHumidity - Math.random() * 3,
        baseHumidity,
        baseHumidity + Math.random() * 3,
        baseHumidity + Math.random() * 5,
        baseHumidity - Math.random() * 2
      ].map(hum => Math.round(Math.min(Math.max(hum, 0), 100))) // 确保湿度在0-100之间

      // 更新所有图表
      updateChartOptions(weatherData.value)
    } else {
      console.error('获取天气数据失败:', data.info || '未知错误')
      throw new Error(data.info || '获取天气数据失败')
    }
  } catch (error) {
    console.error('天气API调用出错:', error)
    // 使用备用数据
    weatherData.value = {
      temperature: '25',
      weather: '晴',
      windDirection: '东南',
      windPower: '3',
      humidity: '65',
      airQuality: '良'
    }

    // 使用备用数据
    historyTemps.value = [23, 24, 25, 26, 25, 24]
    humidityHistory.value = [60, 65, 70, 65, 60, 55]
    updateChartOptions(weatherData.value)
  }
}

// 图表配置
const temperatureOption = ref({
  grid: {
    top: '10%',
    right: '5%',
    bottom: '10%',
    left: '10%'
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c}°C'
  },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    axisLabel: { 
      color: '#fff',
      fontSize: 12
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: { 
      color: '#fff',
      formatter: '{value}°C',
      fontSize: 12
    }
  },
  series: [{
    data: [20, 18, 22, 25, 24, 21],
    type: 'line',
    smooth: true,
    lineStyle: { 
      color: '#00f2ff',
      width: 3
    },
    itemStyle: { 
      color: '#00f2ff',
      borderWidth: 2
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0,
          color: 'rgba(0,242,255,0.3)'
        }, {
          offset: 1,
          color: 'rgba(0,242,255,0.1)'
        }]
      }
    }
  }]
})

const humidityOption = ref({
  grid: {
    top: '10%',
    right: '5%',
    bottom: '10%',
    left: '10%'
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c}%'
  },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    axisLabel: { 
      color: '#fff',
      fontSize: 12
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    axisLabel: { 
      color: '#fff',
      formatter: '{value}%',
      fontSize: 12
    }
  },
  series: [{
    data: [60, 65, 70, 65, 60, 55],
    type: 'line',
    smooth: true,
    lineStyle: { 
      color: '#67e0e3',
      width: 3
    },
    itemStyle: { 
      color: '#67e0e3',
      borderWidth: 2
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0,
          color: 'rgba(103,224,227,0.3)'
        }, {
          offset: 1,
          color: 'rgba(103,224,227,0.1)'
        }]
      }
    }
  }]
})

const airQualityOption = ref({
  series: [{
    type: 'gauge',
    min: 0,
    max: 100,
    splitNumber: 10,
    radius: '90%',
    axisLine: {
      lineStyle: {
        width: 10,
        color: [
          [0.3, '#67e0e3'],
          [0.7, '#37a2da'],
          [1, '#fd666d']
        ]
      }
    },
    pointer: {
      itemStyle: {
        color: '#00f2ff'
      }
    },
    axisTick: {
      distance: -10,
      length: 8,
      lineStyle: {
        color: '#fff'
      }
    },
    splitLine: {
      distance: -10,
      length: 12,
      lineStyle: {
        color: '#fff'
      }
    },
    axisLabel: {
      color: '#fff',
      distance: -20,
      fontSize: 12
    },
    detail: {
      valueAnimation: true,
      formatter: '{value}',
      color: '#fff',
      fontSize: 24,
      offsetCenter: [0, '70%']
    },
    title: {
      fontSize: 14,
      color: '#fff',
      offsetCenter: [0, '95%']
    },
    data: [{
      value: 70,
      name: '空气质量'
    }]
  }]
})

const weatherStatsOption = ref({
  grid: {
    top: '10%',
    right: '5%',
    bottom: '10%',
    left: '10%'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['晴', '多云', '雨', '雪'],
    axisLabel: { 
      color: '#fff',
      fontSize: 12
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: { 
      color: '#fff',
      fontSize: 12
    }
  },
  series: [{
    data: [15, 8, 5, 2],
    type: 'bar',
    barWidth: '40%',
    itemStyle: { 
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0,
          color: '#00f2ff'
        }, {
          offset: 1,
          color: 'rgba(0,242,255,0.3)'
        }]
      }
    }
  }]
})

// 切换城市
const changeCity = (city) => {
  currentCity.value = city
  fetchWeatherData()
}

onMounted(() => {
  // 更新时间
  const updateTime = () => {
    currentTime.value = new Date().toLocaleString('zh-CN', {
      hour12: false
    })
  }
  updateTime()
  timer = setInterval(updateTime, 1000)

  // 获取天气数据
  fetchWeatherData()
  // 每30分钟更新一次天气数据
  const weatherTimer = setInterval(fetchWeatherData, 30 * 60 * 1000)

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    if (weatherTimer) clearInterval(weatherTimer)
  })
})
</script>

<style scoped>
.smart-screen {
  width: 100%;
  height: 100vh;
  padding: 20px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  text-align: center;
  background: rgba(16, 31, 50, 0.8);
  padding: 15px;
  border-radius: 10px;
}

.header h1 {
  font-size: 32px;
  color: #00f2ff;
  margin-bottom: 5px;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
}

.time {
  font-size: 18px;
  color: #00f2ff;
}

.content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.left-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.city-list {
  background: rgba(16, 31, 50, 0.8);
  border-radius: 10px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.city-list::-webkit-scrollbar {
  width: 6px;
}

.city-list::-webkit-scrollbar-track {
  background: rgba(0, 242, 255, 0.1);
  border-radius: 3px;
}

.city-list::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 255, 0.3);
  border-radius: 3px;
}

.city-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 242, 255, 0.5);
}

.city-item {
  padding: 10px 8px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  background: rgba(0, 242, 255, 0.1);
  transition: all 0.3s;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.city-item:hover {
  background: rgba(0, 242, 255, 0.2);
  transform: translateX(5px);
}

.city-item.active {
  background: #00f2ff;
  color: #0a1a2f;
  font-weight: bold;
}

.weather-info {
  flex: 1;
  background: rgba(16, 31, 50, 0.8);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.weather-title {
  font-size: 24px;
  color: #00f2ff;
  margin-bottom: 15px;
}

.weather-temp {
  font-size: 64px;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.weather-desc {
  font-size: 32px;
  color: #00f2ff;
  margin-bottom: 20px;
}

.weather-detail {
  color: #8facc0;
  line-height: 1.8;
  font-size: 18px;
}

.right-panel {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
}

.right-panel .chart-container {
  background: rgba(16, 31, 50, 0.8);
  border-radius: 10px;
  padding: 15px;
}

.right-panel .chart-container:last-child {
  grid-column: span 2;
}

.chart {
  width: 100%;
  height: 100%;
}

@media (max-width: 1400px) {
  .left-panel {
    width: 300px;
  }
}

@media (max-width: 1200px) {
  .content {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    flex-direction: row;
  }

  .city-list {
    width: 400px;
    grid-template-columns: repeat(3, 1fr);
    max-height: none;
  }

  .weather-info {
    flex: 1;
  }

  .right-panel {
    height: 800px;
  }
}

@media (max-width: 768px) {
  .smart-screen {
    padding: 10px;
    gap: 10px;
  }

  .left-panel {
    flex-direction: column;
  }

  .city-list {
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
  }

  .header h1 {
    font-size: 24px;
  }

  .weather-temp {
    font-size: 48px;
  }

  .weather-desc {
    font-size: 24px;
  }

  .right-panel {
    height: auto;
    grid-template-columns: 1fr;
  }

  .right-panel .chart-container {
    height: 300px;
  }

  .right-panel .chart-container:last-child {
    grid-column: auto;
  }
}

@media (max-width: 480px) {
  .city-list {
    grid-template-columns: 1fr;
  }
  
  .city-item {
    padding: 12px 8px;
    font-size: 16px;
  }
}
</style>
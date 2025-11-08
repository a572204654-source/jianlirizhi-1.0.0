/**
 * 部署后测试脚本
 * 
 * 等待部署完成后运行此脚本验证
 */

const axios = require('axios')
const https = require('https')

const API_BASE_URL = 'https://api.yimengpl.com'

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 15000
})

async function test() {
  console.log('=' .repeat(60))
  console.log('部署后验证测试')
  console.log('=' .repeat(60))
  console.log('\nAPI地址:', API_BASE_URL)
  console.log('测试时间:', new Date().toLocaleString('zh-CN'))
  console.log()

  // 1. 健康检查
  console.log('1️⃣  测试健康检查...')
  try {
    const res = await axiosInstance.get(`${API_BASE_URL}/health`)
    console.log('   ✅ 健康检查成功')
    console.log('   响应:', res.data)
  } catch (e) {
    console.log('   ❌ 健康检查失败:', e.message)
    return
  }

  // 2. 测试天气API - 北京
  console.log('\n2️⃣  测试天气API - 北京...')
  try {
    const res = await axiosInstance.get(`${API_BASE_URL}/api/weather/now`, {
      params: { location: '101010100' }
    })
    
    if (res.data.code === 0) {
      console.log('   ✅ 天气API调用成功!')
      console.log('   Message:', res.data.message)
      
      if (res.data.data && res.data.data.data) {
        const weather = res.data.data.data
        console.log('\n   📊 天气信息:')
        console.log('   - 温度:', weather.temp, '°C')
        console.log('   - 天气:', weather.text)
        console.log('   - 体感温度:', weather.feelsLike, '°C')
        console.log('   - 湿度:', weather.humidity, '%')
        console.log('   - 风向:', weather.windDir)
        console.log('   - 风力:', weather.windScale, '级')
        console.log('   - 更新时间:', res.data.data.updateTime)
        
        // 检查<br>标签
        const dataStr = JSON.stringify(res.data.data)
        if (dataStr.includes('<br>') || dataStr.includes('<br/>')) {
          console.log('\n   ⚠️  警告: 数据中仍然包含<br>标签!')
          console.log('   请检查环境变量配置')
        } else {
          console.log('\n   ✅ 确认: 数据中没有<br>标签，问题已解决!')
        }
      }
    } else {
      console.log('   ❌ API返回错误')
      console.log('   Code:', res.data.code)
      console.log('   Message:', res.data.message)
    }
  } catch (e) {
    console.log('   ❌ 天气API失败:', e.message)
    if (e.response) {
      console.log('   状态码:', e.response.status)
      console.log('   响应:', e.response.data)
      
      if (e.response.status === 500 && e.response.data.message.includes('403')) {
        console.log('\n   💡 提示: 仍然是403错误，说明环境变量可能还没生效')
        console.log('   请确认:')
        console.log('   1. 环境变量已正确配置')
        console.log('   2. 服务已重新部署')
        console.log('   3. 新版本已成功启动')
      }
    }
  }

  // 3. 测试天气API - 上海
  console.log('\n3️⃣  测试天气API - 上海...')
  try {
    const res = await axiosInstance.get(`${API_BASE_URL}/api/weather/now`, {
      params: { location: '101020100' }
    })
    
    if (res.data.code === 0 && res.data.data && res.data.data.data) {
      console.log('   ✅ 成功')
      console.log('   温度:', res.data.data.data.temp, '°C')
      console.log('   天气:', res.data.data.data.text)
    } else {
      console.log('   ❌ 失败:', res.data.message)
    }
  } catch (e) {
    console.log('   ❌ 失败:', e.message)
  }

  // 4. 测试城市搜索
  console.log('\n4️⃣  测试城市搜索...')
  try {
    const res = await axiosInstance.get(`${API_BASE_URL}/api/weather/city/search`, {
      params: { location: '北京' }
    })
    
    if (res.data.code === 0) {
      console.log('   ✅ 城市搜索成功')
      if (res.data.data && res.data.data.data && res.data.data.data.length > 0) {
        const city = res.data.data.data[0]
        console.log('   城市:', city.name)
        console.log('   ID:', city.id)
        console.log('   经纬度:', city.lon + ',' + city.lat)
      }
    } else {
      console.log('   ❌ 失败:', res.data.message)
    }
  } catch (e) {
    console.log('   ❌ 失败:', e.message)
  }

  console.log('\n' + '=' .repeat(60))
  console.log('测试完成!')
  console.log('=' .repeat(60))
}

test()


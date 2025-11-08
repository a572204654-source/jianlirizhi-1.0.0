/**
 * 测试和风天气API - 验证<br>标签处理
 */

const axios = require('axios')
const https = require('https')

// 配置
const API_BASE_URL = 'https://supervision-log-api-1gsmvdxu8b8b0e9e-1330337286.ap-shanghai.app.tcloudbase.com'

// 创建axios实例，禁用SSL验证（仅用于测试）
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

async function testWeatherAPI() {
  console.log('=== 测试和风天气API - <br>标签处理 ===\n')

  try {
    // 测试获取天气预报
    console.log('1. 测试获取7天天气预报...')
    const response = await axiosInstance.get(`${API_BASE_URL}/api/weather/daily`, {
      params: {
        location: '101010100' // 北京
      }
    })

    if (response.data.code === 0) {
      console.log('✅ API调用成功')
      console.log(`   返回数据条数: ${response.data.data.daily?.length || 0}`)
      
      // 检查是否还有<br>标签
      const jsonStr = JSON.stringify(response.data)
      if (jsonStr.includes('<br>')) {
        console.log('❌ 警告: 响应中仍包含<br>标签')
        console.log('   示例数据:', JSON.stringify(response.data.data.daily?.[0], null, 2).substring(0, 500))
      } else {
        console.log('✅ 响应中不包含<br>标签，问题已解决！')
        console.log('\n   示例天气数据:')
        if (response.data.data.daily && response.data.data.daily.length > 0) {
          const day = response.data.data.daily[0]
          console.log(`   日期: ${day.fxDate}`)
          console.log(`   白天天气: ${day.textDay}`)
          console.log(`   夜间天气: ${day.textNight}`)
          console.log(`   温度: ${day.tempMin}°C ~ ${day.tempMax}°C`)
        }
      }
    } else {
      console.log('❌ API返回错误:', response.data.message)
    }

    console.log('\n2. 测试实时天气...')
    const nowResponse = await axiosInstance.get(`${API_BASE_URL}/api/weather/now`, {
      params: {
        location: '101010100'
      }
    })

    if (nowResponse.data.code === 0) {
      console.log('✅ 实时天气API调用成功')
      const jsonStr = JSON.stringify(nowResponse.data)
      if (jsonStr.includes('<br>')) {
        console.log('❌ 警告: 响应中仍包含<br>标签')
      } else {
        console.log('✅ 响应中不包含<br>标签')
        if (nowResponse.data.data.now) {
          const now = nowResponse.data.data.now
          console.log(`   当前天气: ${now.text}`)
          console.log(`   温度: ${now.temp}°C`)
          console.log(`   体感温度: ${now.feelsLike}°C`)
        }
      }
    }

    console.log('\n=== 测试完成 ===')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    if (error.response) {
      console.error('   响应状态:', error.response.status)
      console.error('   响应数据:', error.response.data)
    }
  }
}

// 运行测试
testWeatherAPI()


/**
 * 简单的和风天气 API 测试脚本
 * 用于快速验证配置是否正确
 */

const { getWeatherNow } = require('./utils/qweather')

console.log('🌤️  测试和风天气 API...\n')

getWeatherNow('101010100')  // 北京
  .then(result => {
    if (result.success) {
      console.log('✅ API 调用成功!')
      console.log('📍 地点: 北京')
      console.log(`🌡️  温度: ${result.data.temp}°C`)
      console.log(`☁️  天气: ${result.data.text}`)
      console.log(`💨 风向: ${result.data.windDir}`)
      console.log(`💧 湿度: ${result.data.humidity}%`)
      console.log(`⏰ 更新时间: ${result.updateTime}`)
    } else {
      console.log('❌ API 调用失败:', result.error)
    }
  })
  .catch(error => {
    console.error('❌ 错误:', error.message)
  })


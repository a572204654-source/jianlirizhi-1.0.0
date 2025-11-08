/**
 * 简化天气API测试脚本
 * 测试只返回核心天气数据的接口
 */

// 加载环境变量
require('dotenv').config()

const { getSimpleWeather, getWeatherDisplay } = require('../utils/qweather-simple')

// 测试位置（北京）
const testLocation = '116.41,39.92'

async function testSimpleWeather() {
  console.log('========================================')
  console.log('测试简化天气接口')
  console.log('========================================\n')

  try {
    // 1. 测试简化天气数据
    console.log('1. 测试获取简化天气数据...')
    const simpleResult = await getSimpleWeather(testLocation)
    
    if (simpleResult.success) {
      console.log('✅ 获取简化天气成功')
      console.log('数据:', JSON.stringify(simpleResult.data, null, 2))
      console.log('')
      console.log('格式化显示:')
      console.log(`天气：${simpleResult.data.weather}    气温：${simpleResult.data.tempRange}  风向：${simpleResult.data.windDir}  风力：${simpleResult.data.windScale}级`)
    } else {
      console.log('❌ 获取简化天气失败:', simpleResult.error)
    }

    console.log('\n----------------------------------------\n')

    // 2. 测试格式化显示
    console.log('2. 测试获取格式化天气显示...')
    const displayResult = await getWeatherDisplay(testLocation)
    
    if (displayResult.success) {
      console.log('✅ 获取格式化天气成功')
      console.log('显示文本:', displayResult.displayText)
      console.log('')
      console.log('完整数据:')
      console.log(JSON.stringify(displayResult.data, null, 2))
    } else {
      console.log('❌ 获取格式化天气失败:', displayResult.error)
    }

    console.log('\n========================================')
    console.log('测试完成')
    console.log('========================================')

  } catch (error) {
    console.error('测试过程出错:', error)
  }
}

// 运行测试
testSimpleWeather()


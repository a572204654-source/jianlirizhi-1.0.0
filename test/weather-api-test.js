/**
 * 和风天气 API 测试脚本
 * 
 * 测试 JWT 认证和天气接口功能
 */

const { getQWeatherToken } = require('../utils/qweather-jwt')
const {
  getWeatherNow,
  getWeatherDaily,
  getWeatherHourly,
  getAirQuality,
  searchCity,
  getWeatherWarning,
  getWeatherComprehensive
} = require('../utils/qweather')

// 测试位置
const TEST_LOCATIONS = {
  beijing: {
    name: '北京',
    coord: '116.41,39.92',
    cityId: '101010100'
  },
  shanghai: {
    name: '上海',
    coord: '121.47,31.23',
    cityId: '101020100'
  }
}

// 延迟函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

console.log('====================================')
console.log('和风天气 API 测试')
console.log('====================================\n')

// 测试 JWT token 生成
async function testJWTGeneration() {
  console.log('📝 测试 1: JWT Token 生成')
  console.log('-----------------------------------')
  
  try {
    const token = getQWeatherToken()
    console.log('✅ JWT token 生成成功')
    console.log('Token 长度:', token.length)
    console.log('Token 预览:', token.substring(0, 50) + '...')
    console.log('')
    return true
  } catch (error) {
    console.error('❌ JWT token 生成失败:', error.message)
    console.log('')
    return false
  }
}

// 测试实时天气
async function testWeatherNow() {
  console.log('🌤️  测试 2: 获取实时天气')
  console.log('-----------------------------------')
  
  const location = TEST_LOCATIONS.beijing
  console.log(`测试位置: ${location.name} (${location.coord})`)
  
  try {
    const result = await getWeatherNow(location.coord)
    
    if (result.success) {
      console.log('✅ 实时天气获取成功')
      console.log('温度:', result.data.temp + '°C')
      console.log('天气:', result.data.text)
      console.log('体感温度:', result.data.feelsLike + '°C')
      console.log('湿度:', result.data.humidity + '%')
      console.log('风向:', result.data.windDir)
      console.log('风力:', result.data.windScale + '级')
      console.log('更新时间:', result.updateTime)
      console.log('')
      return true
    } else {
      console.error('❌ 实时天气获取失败:', result.error)
      console.log('')
      return false
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('')
    return false
  }
}

// 测试天气预报
async function testWeatherDaily() {
  console.log('📅 测试 3: 获取天气预报（7天）')
  console.log('-----------------------------------')
  
  const location = TEST_LOCATIONS.beijing
  console.log(`测试位置: ${location.name} (${location.coord})`)
  
  try {
    const result = await getWeatherDaily(location.coord, 7)
    
    if (result.success) {
      console.log('✅ 天气预报获取成功')
      console.log(`预报天数: ${result.data.length}天`)
      
      // 显示前3天
      result.data.slice(0, 3).forEach(day => {
        console.log(`${day.fxDate}: ${day.textDay}, ${day.tempMin}°C ~ ${day.tempMax}°C`)
      })
      console.log('...')
      console.log('')
      return true
    } else {
      console.error('❌ 天气预报获取失败:', result.error)
      console.log('')
      return false
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('')
    return false
  }
}

// 测试逐小时预报
async function testWeatherHourly() {
  console.log('⏰ 测试 4: 获取逐小时预报（24小时）')
  console.log('-----------------------------------')
  
  const location = TEST_LOCATIONS.beijing
  console.log(`测试位置: ${location.name} (${location.coord})`)
  
  try {
    const result = await getWeatherHourly(location.coord, 24)
    
    if (result.success) {
      console.log('✅ 逐小时预报获取成功')
      console.log(`预报小时数: ${result.data.length}小时`)
      
      // 显示前3小时
      result.data.slice(0, 3).forEach(hour => {
        console.log(`${hour.fxTime}: ${hour.text}, ${hour.temp}°C`)
      })
      console.log('...')
      console.log('')
      return true
    } else {
      console.error('❌ 逐小时预报获取失败:', result.error)
      console.log('')
      return false
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('')
    return false
  }
}

// 测试空气质量
async function testAirQuality() {
  console.log('💨 测试 5: 获取空气质量')
  console.log('-----------------------------------')
  
  const location = TEST_LOCATIONS.beijing
  console.log(`测试位置: ${location.name} (${location.coord})`)
  
  try {
    const result = await getAirQuality(location.coord)
    
    if (result.success) {
      console.log('✅ 空气质量获取成功')
      console.log('AQI:', result.data.aqi)
      console.log('空气质量:', result.data.category)
      console.log('PM2.5:', result.data.pm2p5)
      console.log('PM10:', result.data.pm10)
      console.log('主要污染物:', result.data.primary || '无')
      console.log('')
      return true
    } else {
      console.error('❌ 空气质量获取失败:', result.error)
      console.log('')
      return false
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('')
    return false
  }
}

// 测试城市搜索
async function testCitySearch() {
  console.log('🔍 测试 6: 城市搜索')
  console.log('-----------------------------------')
  
  const keyword = '北京'
  console.log(`搜索关键词: ${keyword}`)
  
  try {
    const result = await searchCity(keyword)
    
    if (result.success) {
      console.log('✅ 城市搜索成功')
      console.log(`找到 ${result.data.length} 个结果`)
      
      // 显示前3个结果
      result.data.slice(0, 3).forEach(city => {
        console.log(`${city.name} (${city.adm1} ${city.adm2}): ID=${city.id}, 坐标=${city.lon},${city.lat}`)
      })
      if (result.data.length > 3) {
        console.log('...')
      }
      console.log('')
      return true
    } else {
      console.error('❌ 城市搜索失败:', result.error)
      console.log('')
      return false
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('')
    return false
  }
}

// 测试天气预警
async function testWeatherWarning() {
  console.log('⚠️  测试 7: 获取天气预警')
  console.log('-----------------------------------')
  
  const location = TEST_LOCATIONS.beijing
  console.log(`测试位置: ${location.name} (城市ID: ${location.cityId})`)
  
  try {
    const result = await getWeatherWarning(location.cityId)
    
    if (result.success) {
      console.log('✅ 天气预警获取成功')
      
      if (result.data.length > 0) {
        console.log(`当前有 ${result.data.length} 条预警`)
        result.data.forEach(warning => {
          console.log(`${warning.title} (${warning.level}) - ${warning.typeName}`)
        })
      } else {
        console.log('当前无预警信息')
      }
      console.log('')
      return true
    } else {
      console.error('❌ 天气预警获取失败:', result.error)
      console.log('')
      return false
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('')
    return false
  }
}

// 测试综合天气信息
async function testComprehensive() {
  console.log('🌍 测试 8: 获取综合天气信息')
  console.log('-----------------------------------')
  
  const location = TEST_LOCATIONS.shanghai
  console.log(`测试位置: ${location.name} (${location.coord})`)
  
  try {
    const result = await getWeatherComprehensive(location.coord)
    
    if (result.success) {
      console.log('✅ 综合天气信息获取成功')
      
      if (result.data.now) {
        console.log(`实时天气: ${result.data.now.text}, ${result.data.now.temp}°C`)
      }
      
      if (result.data.daily) {
        console.log(`天气预报: ${result.data.daily.length}天`)
      }
      
      if (result.data.hourly) {
        console.log(`逐小时预报: ${result.data.hourly.length}小时`)
      }
      
      if (result.data.air) {
        console.log(`空气质量: AQI ${result.data.air.aqi} (${result.data.air.category})`)
      }
      
      if (result.data.warning && result.data.warning.length > 0) {
        console.log(`天气预警: ${result.data.warning.length}条`)
      } else {
        console.log('天气预警: 无')
      }
      
      console.log('')
      return true
    } else {
      console.error('❌ 综合天气信息获取失败:', result.error)
      console.log('')
      return false
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('')
    return false
  }
}

// 运行所有测试
async function runAllTests() {
  const startTime = Date.now()
  const results = []
  
  try {
    // 加载环境变量
    require('dotenv').config()
    
    // 检查配置
    if (!process.env.QWEATHER_KEY_ID || !process.env.QWEATHER_PROJECT_ID) {
      console.error('❌ 缺少和风天气配置！')
      console.error('请在 .env 文件中配置:')
      console.error('  QWEATHER_KEY_ID=你的凭据ID')
      console.error('  QWEATHER_PROJECT_ID=你的项目ID')
      process.exit(1)
    }
    
    // 运行测试
    results.push(await testJWTGeneration())
    await sleep(1000)
    
    results.push(await testWeatherNow())
    await sleep(1000)
    
    results.push(await testWeatherDaily())
    await sleep(1000)
    
    results.push(await testWeatherHourly())
    await sleep(1000)
    
    results.push(await testAirQuality())
    await sleep(1000)
    
    results.push(await testCitySearch())
    await sleep(1000)
    
    results.push(await testWeatherWarning())
    await sleep(1000)
    
    results.push(await testComprehensive())
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
  
  // 输出测试结果
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  
  console.log('====================================')
  console.log('测试结果汇总')
  console.log('====================================')
  
  const passedTests = results.filter(r => r).length
  const totalTests = results.length
  
  console.log(`总测试数: ${totalTests}`)
  console.log(`通过: ${passedTests}`)
  console.log(`失败: ${totalTests - passedTests}`)
  console.log(`耗时: ${duration}秒`)
  console.log('')
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！')
  } else {
    console.log('⚠️  部分测试失败，请检查配置和网络连接')
  }
  console.log('====================================')
}

// 执行测试
runAllTests().catch(err => {
  console.error('测试执行失败:', err)
  process.exit(1)
})


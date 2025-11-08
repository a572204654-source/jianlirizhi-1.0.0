/**
 * 测试 v1 天气 API
 * 验证路由注册是否成功
 */

const axios = require('axios')

// 配置
const baseURL = 'http://localhost' // 本地测试
// const baseURL = 'https://api.yimengpl.com' // 云端测试

// 测试用的 token（需要先登录获取）
let testToken = ''

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * 测试登录获取 token
 */
async function testLogin() {
  try {
    log('\n=== 测试登录 ===', 'blue')
    
    const response = await axios.post(`${baseURL}/api/auth/login`, {
      code: 'test_code_' + Date.now()
    })
    
    if (response.data.code === 0) {
      testToken = response.data.data.token
      log('✅ 登录成功', 'green')
      log(`Token: ${testToken.substring(0, 20)}...`)
      return true
    } else {
      log('❌ 登录失败: ' + response.data.message, 'red')
      return false
    }
  } catch (error) {
    log('❌ 登录请求失败: ' + error.message, 'red')
    return false
  }
}

/**
 * 测试 v1 天气 API
 */
async function testV1WeatherAPI() {
  try {
    log('\n=== 测试 /api/v1/weather/current ===', 'blue')
    
    // 测试位置：北京
    const latitude = 39.9042
    const longitude = 116.4074
    
    const response = await axios.get(`${baseURL}/api/v1/weather/current`, {
      params: {
        latitude,
        longitude
      },
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    })
    
    log('状态码: ' + response.status, 'yellow')
    log('响应数据:', 'yellow')
    console.log(JSON.stringify(response.data, null, 2))
    
    if (response.data.code === 0) {
      log('✅ v1 天气 API 测试通过', 'green')
      
      const weatherData = response.data.data
      log(`\n天气信息: ${weatherData.weather}`, 'green')
      log(`当前温度: ${weatherData.temperature}℃`, 'green')
      log(`温度范围: ${weatherData.temperatureMin}℃ - ${weatherData.temperatureMax}℃`, 'green')
      log(`湿度: ${weatherData.humidity}%`, 'green')
      log(`风向: ${weatherData.windDirection} ${weatherData.windScale}级`, 'green')
      
      if (weatherData.isMock) {
        log('⚠️  使用的是模拟数据（未配置和风天气API）', 'yellow')
      }
      
      return true
    } else {
      log('❌ API 返回错误: ' + response.data.message, 'red')
      return false
    }
  } catch (error) {
    if (error.response) {
      log(`❌ 请求失败: ${error.response.status} ${error.response.statusText}`, 'red')
      log('错误详情:', 'red')
      console.log(JSON.stringify(error.response.data, null, 2))
    } else {
      log('❌ 请求失败: ' + error.message, 'red')
    }
    return false
  }
}

/**
 * 测试旧版天气 API（对比）
 */
async function testOldWeatherAPI() {
  try {
    log('\n=== 测试 /api/weather/now（旧版对比） ===', 'blue')
    
    const response = await axios.get(`${baseURL}/api/weather/now`, {
      params: {
        location: '116.4074,39.9042' // 北京（经度,纬度）
      },
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    })
    
    if (response.data.code === 0) {
      log('✅ 旧版天气 API 也正常工作', 'green')
      return true
    }
  } catch (error) {
    log('⚠️  旧版 API 测试失败（可能正常）', 'yellow')
    return false
  }
}

/**
 * 主测试流程
 */
async function runTests() {
  log('='.repeat(60), 'blue')
  log('  天气 API v1 路由测试', 'blue')
  log('='.repeat(60), 'blue')
  
  log(`\n测试服务器: ${baseURL}`)
  
  // 1. 先登录获取 token
  const loginSuccess = await testLogin()
  if (!loginSuccess) {
    log('\n❌ 登录失败，无法继续测试', 'red')
    log('请确保后端服务已启动', 'yellow')
    return
  }
  
  // 2. 测试 v1 天气 API
  const v1Success = await testV1WeatherAPI()
  
  // 3. 测试旧版 API（对比）
  await testOldWeatherAPI()
  
  // 总结
  log('\n' + '='.repeat(60), 'blue')
  if (v1Success) {
    log('✅ 测试完成！v1 天气 API 路由注册成功', 'green')
    log('\n前端可以使用以下路径:', 'green')
    log('  GET /api/v1/weather/current?latitude=39.9042&longitude=116.4074', 'yellow')
    log('\n需要在请求头中携带 token:', 'yellow')
    log('  Authorization: Bearer {token}', 'yellow')
  } else {
    log('❌ 测试失败！请检查路由配置', 'red')
  }
  log('='.repeat(60), 'blue')
}

// 运行测试
runTests().catch(error => {
  log('测试过程出错: ' + error.message, 'red')
  console.error(error)
})


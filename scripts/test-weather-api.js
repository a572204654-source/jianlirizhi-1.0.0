/**
 * 和风天气接口测试脚本
 * 
 * 测试云托管环境的天气接口是否正常工作
 */

const https = require('https')

// 配置
const API_BASE_URL = 'https://api.yimengpl.com'

/**
 * 发送 HTTP 请求
 */
function request(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          })
        } catch (error) {
          reject(new Error('解析响应失败: ' + error.message))
        }
      })
    }).on('error', (error) => {
      reject(error)
    })
  })
}

/**
 * 测试实时天气接口
 */
async function testNowWeather() {
  console.log('\n========================================')
  console.log('📍 测试1: 实时天气（北京天安门）')
  console.log('========================================')
  
  const url = `${API_BASE_URL}/api/weather/now?location=116.41,39.92`
  console.log('请求URL:', url)
  
  try {
    const result = await request(url)
    console.log('HTTP状态码:', result.statusCode)
    console.log('响应数据:', JSON.stringify(result.data, null, 2))
    
    if (result.statusCode === 200 && result.data.code === 0) {
      console.log('✅ 测试通过')
      return true
    } else {
      console.log('❌ 测试失败: 返回错误')
      return false
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
    return false
  }
}

/**
 * 测试简化天气接口
 */
async function testSimpleWeather() {
  console.log('\n========================================')
  console.log('📍 测试2: 简化天气接口（北京）')
  console.log('========================================')
  
  const url = `${API_BASE_URL}/api/weather/simple?location=101010100`
  console.log('请求URL:', url)
  
  try {
    const result = await request(url)
    console.log('HTTP状态码:', result.statusCode)
    console.log('响应数据:', JSON.stringify(result.data, null, 2))
    
    if (result.statusCode === 200 && result.data.code === 0) {
      console.log('✅ 测试通过')
      return true
    } else {
      console.log('❌ 测试失败: 返回错误')
      return false
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
    return false
  }
}

/**
 * 测试3天天气预报
 */
async function test3DaysForecast() {
  console.log('\n========================================')
  console.log('📍 测试3: 3天天气预报（上海）')
  console.log('========================================')
  
  const url = `${API_BASE_URL}/api/weather/3d?location=101020100`
  console.log('请求URL:', url)
  
  try {
    const result = await request(url)
    console.log('HTTP状态码:', result.statusCode)
    console.log('响应数据:', JSON.stringify(result.data, null, 2))
    
    if (result.statusCode === 200 && result.data.code === 0) {
      console.log('✅ 测试通过')
      return true
    } else {
      console.log('❌ 测试失败: 返回错误')
      return false
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
    return false
  }
}

/**
 * 测试7天天气预报
 */
async function test7DaysForecast() {
  console.log('\n========================================')
  console.log('📍 测试4: 7天天气预报（深圳）')
  console.log('========================================')
  
  const url = `${API_BASE_URL}/api/weather/7d?location=101280601`
  console.log('请求URL:', url)
  
  try {
    const result = await request(url)
    console.log('HTTP状态码:', result.statusCode)
    console.log('响应数据:', JSON.stringify(result.data, null, 2))
    
    if (result.statusCode === 200 && result.data.code === 0) {
      console.log('✅ 测试通过')
      return true
    } else {
      console.log('❌ 测试失败: 返回错误')
      return false
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
    return false
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 开始测试和风天气接口')
  console.log('目标域名:', API_BASE_URL)
  console.log('测试时间:', new Date().toLocaleString('zh-CN'))
  
  const results = []
  
  // 执行所有测试
  results.push(await testNowWeather())
  results.push(await testSimpleWeather())
  results.push(await test3DaysForecast())
  results.push(await test7DaysForecast())
  
  // 统计结果
  console.log('\n========================================')
  console.log('📊 测试结果汇总')
  console.log('========================================')
  
  const passCount = results.filter(r => r).length
  const totalCount = results.length
  
  console.log(`总测试数: ${totalCount}`)
  console.log(`通过数: ${passCount}`)
  console.log(`失败数: ${totalCount - passCount}`)
  
  if (passCount === totalCount) {
    console.log('\n🎉 所有测试通过！和风天气接口配置成功！')
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置')
  }
  
  console.log('\n========================================')
}

// 运行测试
main().catch(error => {
  console.error('测试执行失败:', error)
  process.exit(1)
})


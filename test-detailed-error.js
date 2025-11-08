const axios = require('axios')

const API_BASE_URL = 'https://api.yimengpl.com'

async function testWithDetails() {
  console.log('============================================================')
  console.log('详细错误诊断')
  console.log('============================================================\n')

  try {
    console.log('🔍 测试天气API...')
    const response = await axios.get(`${API_BASE_URL}/api/weather/now`, {
      params: { location: '101010100' },
      timeout: 10000,
      validateStatus: () => true // 接受所有状态码
    })

    console.log('状态码:', response.status)
    console.log('响应数据:', JSON.stringify(response.data, null, 2))

    // 如果有错误信息，尝试解析
    if (response.data && response.data.message) {
      console.log('\n❌ 错误消息:', response.data.message)
      
      // 检查是否是403错误
      if (response.data.message.includes('403')) {
        console.log('\n💡 403错误通常表示:')
        console.log('   1. 环境变量未配置')
        console.log('   2. 环境变量配置错误')
        console.log('   3. 服务未重新部署')
        console.log('   4. 私钥格式不正确')
        console.log('\n📋 请检查云托管控制台:')
        console.log('   - QWEATHER_KEY_ID = CE5AYF96K5')
        console.log('   - QWEATHER_PROJECT_ID = 288AH4E373')
        console.log('   - QWEATHER_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----<br>...<br>-----END PRIVATE KEY-----<br>')
      }
    }
  } catch (error) {
    console.log('❌ 请求异常:', error.message)
  }

  console.log('\n============================================================')
}

testWithDetails()


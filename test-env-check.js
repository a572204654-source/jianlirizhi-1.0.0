const axios = require('axios')

const API_BASE_URL = 'https://api.yimengpl.com'

async function checkEnvironment() {
  console.log('============================================================')
  console.log('检查云托管环境变量配置')
  console.log('============================================================\n')

  try {
    // 调用一个诊断接口来查看环境变量状态
    const response = await axios.get(`${API_BASE_URL}/api/weather/debug-config`, {
      timeout: 10000
    })

    console.log('✅ 环境变量状态:')
    console.log(JSON.stringify(response.data, null, 2))
  } catch (error) {
    if (error.response) {
      console.log('❌ 请求失败')
      console.log('状态码:', error.response.status)
      console.log('响应:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.log('❌ 网络错误:', error.message)
    }
  }

  console.log('\n============================================================')
}

checkEnvironment()


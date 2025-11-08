/**
 * 测试JWT生成
 */

require('dotenv').config()
const { getQWeatherToken } = require('./utils/qweather-jwt')

console.log('测试和风天气JWT生成...\n')
console.log('环境变量检查:')
console.log('- QWEATHER_KEY_ID:', process.env.QWEATHER_KEY_ID ? '已配置 ✅' : '未配置 ❌')
console.log('- QWEATHER_PROJECT_ID:', process.env.QWEATHER_PROJECT_ID ? '已配置 ✅' : '未配置 ❌')
console.log('- QWEATHER_PRIVATE_KEY:', process.env.QWEATHER_PRIVATE_KEY ? '已配置 ✅' : '未配置 ❌')

if (process.env.QWEATHER_PRIVATE_KEY) {
  console.log('\n私钥预览（前50个字符）:')
  console.log(process.env.QWEATHER_PRIVATE_KEY.substring(0, 50) + '...')
  
  // 检查是否包含<br>标签
  if (process.env.QWEATHER_PRIVATE_KEY.includes('<br>')) {
    console.log('\n⚠️  警告: 私钥中包含<br>标签，将自动替换为换行符')
  }
}

console.log('\n' + '='.repeat(60))

try {
  console.log('\n尝试生成JWT token...')
  const token = getQWeatherToken()
  console.log('✅ JWT生成成功!')
  console.log('Token预览:', token.substring(0, 50) + '...')
  console.log('Token长度:', token.length)
} catch (error) {
  console.log('❌ JWT生成失败!')
  console.log('错误:', error.message)
}


/**
 * JWT调试工具
 * 用于检查生成的JWT token
 */

require('dotenv').config()
const { getQWeatherToken } = require('../utils/qweather-jwt')

console.log('====================================')
console.log('和风天气 JWT Token 调试')
console.log('====================================\n')

console.log('环境变量配置:')
console.log('QWEATHER_KEY_ID:', process.env.QWEATHER_KEY_ID || '(未配置)')
console.log('QWEATHER_PROJECT_ID:', process.env.QWEATHER_PROJECT_ID || '(未配置)')
console.log('')

try {
  const token = getQWeatherToken()
  
  console.log('✅ JWT Token 生成成功\n')
  console.log('完整Token:')
  console.log(token)
  console.log('')
  
  // 解析JWT（不验证签名，仅用于调试）
  const parts = token.split('.')
  if (parts.length === 3) {
    // 解码Header
    const headerBase64 = parts[0]
    const headerJson = Buffer.from(headerBase64, 'base64url').toString('utf8')
    const header = JSON.parse(headerJson)
    
    console.log('JWT Header:')
    console.log(JSON.stringify(header, null, 2))
    console.log('')
    
    // 解码Payload
    const payloadBase64 = parts[1]
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadJson)
    
    console.log('JWT Payload:')
    console.log(JSON.stringify(payload, null, 2))
    console.log('')
    
    // 验证时间
    const now = Math.floor(Date.now() / 1000)
    console.log('Token 时间验证:')
    console.log('当前时间戳:', now)
    console.log('签发时间(iat):', payload.iat, new Date(payload.iat * 1000).toLocaleString())
    console.log('过期时间(exp):', payload.exp, new Date(payload.exp * 1000).toLocaleString())
    console.log('是否已过期:', now > payload.exp ? '是' : '否')
    console.log('剩余有效时间:', Math.floor((payload.exp - now) / 60), '分钟')
    console.log('')
    
    console.log('签名长度:', parts[2].length, '字符')
  }
} catch (error) {
  console.error('❌ JWT Token 生成失败')
  console.error('错误信息:', error.message)
  console.error('错误堆栈:', error.stack)
}


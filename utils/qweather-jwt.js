/**
 * 和风天气 JWT 认证工具
 * 
 * 使用 Ed25519 算法生成 JWT token
 * 文档: https://dev.qweather.com/docs/resource/signature-auth/
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/**
 * 生成和风天气 JWT token
 * 
 * @param {string} kid - 凭据ID (从和风天气控制台获取)
 * @param {string} sub - 项目ID (从和风天气控制台获取)
 * @param {string} privateKeyPath - 私钥文件路径
 * @returns {string} JWT token
 */
function generateQWeatherToken(kid, sub, privateKeyPath) {
  try {
    // 读取私钥
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8')
    
    // JWT Header
    const header = {
      alg: 'EdDSA',  // Ed25519 使用 EdDSA 算法
      typ: 'JWT',
      kid: kid       // 凭据ID
    }
    
    // JWT Payload
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      sub: sub,           // 项目ID
      iat: now,           // 签发时间
      exp: now + 3600     // 过期时间（1小时后）
    }
    
    // Base64Url 编码
    const base64UrlEncode = (obj) => {
      const json = JSON.stringify(obj)
      return Buffer.from(json)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    }
    
    // 生成签名内容
    const headerEncoded = base64UrlEncode(header)
    const payloadEncoded = base64UrlEncode(payload)
    const signatureInput = `${headerEncoded}.${payloadEncoded}`
    
    // 使用 Ed25519 私钥签名
    const sign = crypto.sign(null, Buffer.from(signatureInput), {
      key: privateKey,
      format: 'pem'
    })
    
    // Base64Url 编码签名
    const signatureEncoded = sign
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    
    // 生成完整的 JWT
    const jwt = `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`
    
    return jwt
  } catch (error) {
    console.error('生成和风天气JWT失败:', error)
    throw new Error('生成JWT失败: ' + error.message)
  }
}

/**
 * JWT token 缓存
 * 避免频繁生成 token
 */
let tokenCache = {
  token: null,
  expireTime: 0
}

/**
 * 获取和风天气 JWT token（带缓存）
 * 
 * @returns {string} JWT token
 */
function getQWeatherToken() {
  const now = Date.now()
  
  // 如果 token 还没过期，返回缓存的 token
  // 提前5分钟刷新，避免在请求时过期
  if (tokenCache.token && tokenCache.expireTime > now + 5 * 60 * 1000) {
    return tokenCache.token
  }
  
  // 获取配置
  const kid = process.env.QWEATHER_KEY_ID
  const sub = process.env.QWEATHER_PROJECT_ID
  const privateKeyPath = path.join(__dirname, '..', 'ed25519-private.pem')
  
  // 验证配置
  if (!kid || !sub) {
    throw new Error('和风天气配置不完整，请检查环境变量 QWEATHER_KEY_ID 和 QWEATHER_PROJECT_ID')
  }
  
  // 检查私钥文件是否存在
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`私钥文件不存在: ${privateKeyPath}`)
  }
  
  // 生成新的 token
  const token = generateQWeatherToken(kid, sub, privateKeyPath)
  
  // 更新缓存（token 有效期1小时）
  tokenCache = {
    token: token,
    expireTime: now + 60 * 60 * 1000  // 1小时后过期
  }
  
  return token
}

/**
 * 清除 token 缓存
 * 用于测试或强制刷新
 */
function clearTokenCache() {
  tokenCache = {
    token: null,
    expireTime: 0
  }
}

module.exports = {
  generateQWeatherToken,
  getQWeatherToken,
  clearTokenCache
}


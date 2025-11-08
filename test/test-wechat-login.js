/**
 * 微信登录功能快速测试脚本
 * 
 * 使用方法：
 * 1. 确保服务已启动：npm start
 * 2. 运行测试：node test/test-wechat-login.js
 */

const http = require('http')

// 配置
const config = {
  host: 'localhost',
  port: 80,
  testOpenid: 'test_openid_888888'
}

/**
 * HTTP 请求封装
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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
        } catch (err) {
          reject(new Error('响应解析失败: ' + err.message))
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    if (options.body) {
      req.write(options.body)
    }

    req.end()
  })
}

/**
 * 测试1：测试登录接口
 */
async function testLogin() {
  console.log('\n🧪 测试1: 测试登录接口')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const response = await request({
      host: config.host,
      port: config.port,
      path: '/api/auth/test-login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        openid: config.testOpenid
      })
    })

    if (response.statusCode !== 200) {
      throw new Error(`HTTP 状态码错误: ${response.statusCode}`)
    }

    if (response.data.code !== 0) {
      throw new Error(`响应错误: ${response.data.message}`)
    }

    if (!response.data.data.token) {
      throw new Error('未返回 token')
    }

    console.log('✅ 测试通过')
    console.log('   Token:', response.data.data.token.substring(0, 30) + '...')
    console.log('   用户ID:', response.data.data.userInfo.id)
    console.log('   昵称:', response.data.data.userInfo.nickname)
    console.log('   是否新用户:', response.data.data.isNewUser)

    return response.data.data.token
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
    return null
  }
}

/**
 * 测试2：使用开发模式的测试 code 登录
 */
async function testLoginWithTestCode() {
  console.log('\n🧪 测试2: 使用测试 code 登录')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const testCode = 'test_wechat_code_' + Date.now()

    const response = await request({
      host: config.host,
      port: config.port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: testCode
      })
    })

    if (response.statusCode !== 200) {
      throw new Error(`HTTP 状态码错误: ${response.statusCode}`)
    }

    if (response.data.code !== 0) {
      throw new Error(`响应错误: ${response.data.message}`)
    }

    if (!response.data.data.token) {
      throw new Error('未返回 token')
    }

    console.log('✅ 测试通过')
    console.log('   消息:', response.data.message)
    console.log('   Token:', response.data.data.token.substring(0, 30) + '...')
    console.log('   用户ID:', response.data.data.userInfo.id)

    return response.data.data.token
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
    return null
  }
}

/**
 * 测试3：Token 认证
 */
async function testTokenAuth(token) {
  console.log('\n🧪 测试3: Token 认证')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!token) {
    console.log('❌ 测试跳过: 未获取到 token')
    return
  }

  try {
    const response = await request({
      host: config.host,
      port: config.port,
      path: '/api/v1/users/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.statusCode !== 200) {
      throw new Error(`HTTP 状态码错误: ${response.statusCode}`)
    }

    if (response.data.code !== 0) {
      throw new Error(`响应错误: ${response.data.message}`)
    }

    console.log('✅ 测试通过')
    console.log('   用户ID:', response.data.data.id)
    console.log('   昵称:', response.data.data.nickname)
    console.log('   组织:', response.data.data.organization || '(未设置)')
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
  }
}

/**
 * 测试4：无效 token 认证
 */
async function testInvalidToken() {
  console.log('\n🧪 测试4: 无效 Token 认证')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const response = await request({
      host: config.host,
      port: config.port,
      path: '/api/v1/users/me',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token_12345'
      }
    })

    if (response.statusCode === 401 || response.data.code === 401) {
      console.log('✅ 测试通过（正确返回 401 未授权）')
      console.log('   消息:', response.data.message)
    } else {
      throw new Error('应该返回 401 但返回了: ' + response.statusCode)
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
  }
}

/**
 * 测试5：缺少必需参数
 */
async function testMissingParams() {
  console.log('\n🧪 测试5: 缺少必需参数')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const response = await request({
      host: config.host,
      port: config.port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (response.data.code === 400) {
      console.log('✅ 测试通过（正确返回 400 参数错误）')
      console.log('   消息:', response.data.message)
    } else {
      throw new Error('应该返回 400 但返回了: ' + response.data.code)
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
  }
}

/**
 * 测试6：退出登录
 */
async function testLogout(token) {
  console.log('\n🧪 测试6: 退出登录')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!token) {
    console.log('❌ 测试跳过: 未获取到 token')
    return
  }

  try {
    const response = await request({
      host: config.host,
      port: config.port,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.statusCode !== 200) {
      throw new Error(`HTTP 状态码错误: ${response.statusCode}`)
    }

    if (response.data.code !== 0) {
      throw new Error(`响应错误: ${response.data.message}`)
    }

    console.log('✅ 测试通过')
    console.log('   消息:', response.data.message)
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║         微信一键登录功能测试                               ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')

  console.log('\n📋 测试配置:')
  console.log('   服务地址:', `http://${config.host}:${config.port}`)
  console.log('   测试 OpenID:', config.testOpenid)

  // 运行测试
  const token1 = await testLogin()
  const token2 = await testLoginWithTestCode()
  await testTokenAuth(token1 || token2)
  await testInvalidToken()
  await testMissingParams()
  await testLogout(token1 || token2)

  // 测试总结
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║         测试完成                                          ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')

  console.log('\n📝 测试说明:')
  console.log('   1. 如果所有测试都通过，说明登录功能正常')
  console.log('   2. 如果测试1失败，请先在数据库创建测试用户:')
  console.log('      INSERT INTO users (openid, nickname) VALUES')
  console.log('      (\'test_openid_888888\', \'测试用户\');')
  console.log('   3. 如果测试2失败，请确保 NODE_ENV=development')
  console.log('   4. 查看完整测试指南: docs/微信一键登录测试指南.md')
  console.log('')
}

// 运行测试
main().catch((error) => {
  console.error('\n❌ 测试脚本执行失败:', error)
  process.exit(1)
})


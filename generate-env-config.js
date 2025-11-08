/**
 * 生成云托管环境变量配置
 * 
 * 将私钥文件转换为适合云托管的格式
 */

const fs = require('fs')
const path = require('path')

console.log('生成云托管环境变量配置\n')
console.log('=' .repeat(60))

// 读取 .env 文件
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env 文件不存在')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const envLines = envContent.split('\n')

// 解析环境变量
const envVars = {}
envLines.forEach(line => {
  line = line.trim()
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=').trim()
    envVars[key.trim()] = value
  }
})

console.log('\n当前 .env 配置:')
console.log('- QWEATHER_KEY_ID:', envVars.QWEATHER_KEY_ID || '未配置')
console.log('- QWEATHER_PROJECT_ID:', envVars.QWEATHER_PROJECT_ID || '未配置')

// 读取私钥文件
const privateKeyPath = path.join(__dirname, 'ed25519-private.pem')
if (!fs.existsSync(privateKeyPath)) {
  console.log('\n❌ 私钥文件不存在:', privateKeyPath)
  process.exit(1)
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8')
console.log('- 私钥文件: 已读取 ✅')

console.log('\n' + '=' .repeat(60))
console.log('\n📋 云托管环境变量配置（复制以下内容）:\n')

console.log('变量名: QWEATHER_KEY_ID')
console.log('变量值:', envVars.QWEATHER_KEY_ID || '请填写')
console.log()

console.log('变量名: QWEATHER_PROJECT_ID')
console.log('变量值:', envVars.QWEATHER_PROJECT_ID || '请填写')
console.log()

console.log('变量名: QWEATHER_PRIVATE_KEY')
console.log('变量值（方式1 - 保持换行符）:')
console.log('---开始---')
console.log(privateKey)
console.log('---结束---')
console.log()

console.log('变量值（方式2 - 使用<br>替换换行符）:')
const privateKeyWithBr = privateKey.replace(/\n/g, '<br>')
console.log('---开始---')
console.log(privateKeyWithBr)
console.log('---结束---')

console.log('\n' + '=' .repeat(60))
console.log('\n💡 配置说明:')
console.log('1. 登录腾讯云控制台')
console.log('2. 进入云托管 → supervision-log-api → 环境变量')
console.log('3. 添加上述三个环境变量')
console.log('4. 如果界面支持多行输入，使用方式1')
console.log('5. 如果界面只支持单行，使用方式2（带<br>的版本）')
console.log('6. 保存后重新部署服务')
console.log()


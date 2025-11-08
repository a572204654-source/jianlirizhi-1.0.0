/**
 * 显示私钥内容，用于配置到云托管环境变量
 */

const fs = require('fs')
const path = require('path')

const privateKeyPath = path.join(__dirname, '..', 'ed25519-private.pem')

console.log('='.repeat(60))
console.log('📋 和风天气私钥内容（用于云托管环境变量配置）')
console.log('='.repeat(60))
console.log('')

if (!fs.existsSync(privateKeyPath)) {
  console.error('❌ 错误：私钥文件不存在！')
  console.log('')
  console.log('请先运行以下命令生成密钥：')
  console.log('  node scripts/generate-ed25519-keys.js')
  console.log('')
  process.exit(1)
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8')

console.log('🔐 私钥内容（完整复制以下内容）：')
console.log('-'.repeat(60))
console.log(privateKey)
console.log('-'.repeat(60))
console.log('')

console.log('📝 配置步骤：')
console.log('')
console.log('1. 登录腾讯云 CloudBase 控制台')
console.log('2. 进入你的云托管服务')
console.log('3. 点击"环境变量"或"配置管理"')
console.log('4. 添加新的环境变量：')
console.log('   - 变量名：QWEATHER_PRIVATE_KEY')
console.log('   - 变量值：上面的完整私钥内容（包括 BEGIN 和 END 行）')
console.log('5. 保存并重新部署服务')
console.log('')

console.log('✅ 需要配置的环境变量：')
console.log('   - QWEATHER_PROJECT_ID = 288AH4E373')
console.log('   - QWEATHER_KEY_ID = CE5AYF96K5')
console.log('   - QWEATHER_PRIVATE_KEY = （上面的私钥内容）')
console.log('')

console.log('⚠️  安全提示：')
console.log('   - 不要将私钥内容提交到 Git 仓库')
console.log('   - 不要在公开场合分享私钥')
console.log('   - 云托管的环境变量是加密存储的，安全可靠')
console.log('')
console.log('='.repeat(60))


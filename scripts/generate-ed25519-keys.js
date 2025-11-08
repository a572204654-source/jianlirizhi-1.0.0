/**
 * 生成和风天气所需的 Ed25519 密钥对
 * 用于 JWT 身份认证
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// 生成 Ed25519 密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

// 保存密钥到文件
const privateKeyPath = path.join(__dirname, '..', 'ed25519-private.pem')
const publicKeyPath = path.join(__dirname, '..', 'ed25519-public.pem')

fs.writeFileSync(privateKeyPath, privateKey)
fs.writeFileSync(publicKeyPath, publicKey)

console.log('✅ Ed25519 密钥对生成成功！\n')
console.log('📁 文件位置:')
console.log('   私钥: ed25519-private.pem')
console.log('   公钥: ed25519-public.pem\n')

console.log('🔐 公钥内容（需要上传到和风天气控制台）:')
console.log('─────────────────────────────────────────────')
console.log(publicKey)
console.log('─────────────────────────────────────────────\n')

// 计算公钥的 SHA256 值，用于验证
const publicKeyHash = crypto.createHash('sha256').update(publicKey).digest('hex')
console.log('🔑 公钥 SHA256 值（用于验证）:')
console.log(`   ${publicKeyHash}\n`)

console.log('📋 下一步操作:')
console.log('   1. 登录和风天气控制台: https://console.qweather.com')
console.log('   2. 进入"项目管理"')
console.log('   3. 选择您的项目，点击"添加凭据"')
console.log('   4. 选择"JSON Web Token"方式')
console.log('   5. 复制上面的公钥内容，粘贴到控制台')
console.log('   6. 保存后记录凭据ID（kid）和项目ID（sub）\n')

console.log('⚠️  安全提示:')
console.log('   - 私钥文件(ed25519-private.pem)必须妥善保管，不要泄露')
console.log('   - 不要将私钥提交到代码仓库')
console.log('   - 建议将 *.pem 添加到 .gitignore')


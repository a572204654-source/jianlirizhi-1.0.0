/**
 * 生成 Ed25519 密钥对
 * 用于和风天气 JWT 认证
 */

const crypto = require('crypto')
const fs = require('fs')

console.log('正在生成 Ed25519 密钥对...\n')

// 生成密钥对
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

// 保存私钥
fs.writeFileSync('ed25519-private.pem', privateKey)
console.log('✅ 私钥已保存到: ed25519-private.pem')
console.log('⚠️  请妥善保管私钥，不要泄露给任何人！\n')

// 保存公钥
fs.writeFileSync('ed25519-public.pem', publicKey)
console.log('✅ 公钥已保存到: ed25519-public.pem\n')

// 显示公钥内容（需要上传到和风天气控制台）
console.log('============================================================')
console.log('📋 公钥内容（复制下面的全部内容上传到和风天气控制台）:')
console.log('============================================================\n')
console.log(publicKey)
console.log('============================================================\n')

// 计算公钥的 SHA256 值
const publicKeySha256 = crypto.createHash('sha256').update(publicKey).digest('hex')
console.log('🔐 公钥 SHA256 值（用于验证）:')
console.log(publicKeySha256)
console.log('\n============================================================\n')

// 显示私钥内容（用于配置 .env）
console.log('🔑 私钥内容（配置到 .env 文件中）:')
console.log('============================================================\n')
console.log(privateKey)
console.log('============================================================\n')

// 生成适合 .env 的格式（使用 <br> 替换换行符）
const privateKeyForEnv = privateKey.replace(/\n/g, '<br>')
console.log('📝 .env 格式的私钥（使用 <br> 替换换行符）:')
console.log('============================================================')
console.log(privateKeyForEnv)
console.log('============================================================\n')

console.log('✅ 密钥生成完成！\n')
console.log('📖 下一步操作：')
console.log('1. 登录和风天气控制台: https://console.qweather.com')
console.log('2. 进入项目管理 → 选择项目')
console.log('3. 点击"添加凭据"按钮')
console.log('4. 选择身份认证方式: JSON Web Token')
console.log('5. 复制上面的公钥内容，粘贴到控制台的公钥文本框')
console.log('6. 保存后，记录下凭据ID (kid) 和项目ID (sub)')
console.log('7. 将凭据ID、项目ID和私钥配置到 .env 文件中')
console.log('\n参考文档: https://dev.qweather.com/docs/configuration/authentication/#json-web-token')


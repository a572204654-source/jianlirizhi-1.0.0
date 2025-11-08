/**
 * 语音识别系统安装脚本
 * 
 * 功能：
 * 1. 检查依赖是否安装
 * 2. 检查环境变量配置
 * 3. 初始化数据库表
 * 4. 测试API连接
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🎤 语音识别系统安装向导\n')
console.log('=' .repeat(50))

// 步骤1：检查Node.js版本
console.log('\n✓ 检查Node.js版本...')
const nodeVersion = process.version
console.log(`  Node.js版本: ${nodeVersion}`)

if (parseInt(nodeVersion.slice(1)) < 14) {
  console.error('❌ 错误: 需要Node.js 14或更高版本')
  process.exit(1)
}

// 步骤2：检查依赖包
console.log('\n✓ 检查依赖包...')
const packageJson = require('../package.json')
const requiredDeps = ['multer', 'axios']

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`  ✓ ${dep}: ${packageJson.dependencies[dep]}`)
  } else {
    console.error(`  ❌ 缺少依赖: ${dep}`)
    console.log('  请运行: npm install')
    process.exit(1)
  }
})

// 步骤3：检查环境变量配置
console.log('\n✓ 检查环境变量配置...')
require('dotenv').config()

const requiredEnvVars = [
  'TENCENT_SECRET_ID',
  'TENCENT_SECRET_KEY',
  'TENCENT_APP_ID',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME'
]

let missingVars = []

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✓ ${varName}: 已配置`)
  } else {
    console.log(`  ❌ ${varName}: 未配置`)
    missingVars.push(varName)
  }
})

if (missingVars.length > 0) {
  console.error('\n❌ 错误: 以下环境变量未配置:')
  missingVars.forEach(v => console.error(`   - ${v}`))
  console.log('\n请在 .env 文件中配置这些变量')
  console.log('参考 .env.example 文件')
  process.exit(1)
}

// 步骤4：检查数据库连接
console.log('\n✓ 检查数据库连接...')
const { testConnection } = require('../config/database')

testConnection()
  .then(() => {
    console.log('  ✓ 数据库连接成功')
    
    // 步骤5：初始化数据库表
    console.log('\n✓ 初始化数据库表...')
    const sqlFile = path.join(__dirname, 'init-voice-recognition-tables.sql')
    
    if (fs.existsSync(sqlFile)) {
      console.log('  找到SQL文件: init-voice-recognition-tables.sql')
      console.log('  请手动执行以下命令初始化数据库:')
      console.log(`  mysql -u ${process.env.DB_USER} -p ${process.env.DB_NAME} < scripts/init-voice-recognition-tables.sql`)
    } else {
      console.error('  ❌ 未找到SQL文件')
    }
    
    // 步骤6：输出配置信息
    console.log('\n✓ 配置信息:')
    console.log(`  数据库: ${process.env.DB_NAME}`)
    console.log(`  用户: ${process.env.DB_USER}`)
    console.log(`  腾讯云区域: ${process.env.TENCENT_REGION || 'ap-guangzhou'}`)
    
    // 步骤7：完成
    console.log('\n' + '='.repeat(50))
    console.log('✅ 语音识别系统配置检查完成!')
    console.log('\n📚 后续步骤:')
    console.log('  1. 执行SQL脚本初始化数据库表')
    console.log('  2. 运行 npm start 启动服务')
    console.log('  3. 访问 http://localhost/api/voice-recognition/stats 测试接口')
    console.log('  4. 查看完整文档: docs/VOICE_RECOGNITION.md')
    console.log('  5. 查看快速开始: README_VOICE.md')
    console.log('\n🎉 祝使用愉快!')
    
  })
  .catch(err => {
    console.error('  ❌ 数据库连接失败:', err.message)
    console.log('\n请检查以下配置:')
    console.log('  - DB_HOST (内网/外网地址)')
    console.log('  - DB_PORT')
    console.log('  - DB_USER')
    console.log('  - DB_PASSWORD')
    console.log('  - DB_NAME')
    process.exit(1)
  })


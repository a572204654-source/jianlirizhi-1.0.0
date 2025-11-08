/**
 * 云托管Word导出功能测试
 * 
 * 使用方法：
 * node test/api-test/test-cloudrun-word-export.js
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

// ========== 配置区域 ==========
const CONFIG = {
  // 云托管API地址
  baseURL: 'https://api.yimengpl.com',
  
  // 测试用户token（请先通过小程序登录获取）
  // 或者使用测试接口生成token
  token: '',
  
  // 输出目录
  outputDir: path.join(__dirname, '../../test-output'),
  
  // 测试日志ID（如果为空，会自动创建测试数据）
  testLogId: null
}

// ========== 颜色输出 ==========
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset)
}

function success(msg) {
  log('✅ ' + msg, 'green')
}

function error(msg) {
  log('❌ ' + msg, 'red')
}

function info(msg) {
  log('ℹ️  ' + msg, 'cyan')
}

function section(msg) {
  log('\n' + '='.repeat(60), 'blue')
  log(msg, 'bright')
  log('='.repeat(60), 'blue')
}

// ========== HTTP客户端 ==========
const client = axios.create({
  baseURL: CONFIG.baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加请求拦截器（自动添加token）
client.interceptors.request.use(config => {
  if (CONFIG.token) {
    config.headers['Authorization'] = `Bearer ${CONFIG.token}`
  }
  return config
})

// ========== 测试数据 ==========
let testData = {
  userId: null,
  projectId: null,
  workId: null,
  logId: null
}

// ========== 步骤1：登录获取token ==========
async function testLogin() {
  section('步骤1：用户登录')
  
  try {
    // 使用已存在的测试用户登录
    const testOpenid = 'test_openid_001'
    
    info(`尝试使用测试用户登录: ${testOpenid}`)
    
    const response = await client.post('/api/auth/test-login', {
      openid: testOpenid
    })
    
    if (response.data.code === 0) {
      CONFIG.token = response.data.data.token
      testData.userId = response.data.data.userInfo.id
      
      success('登录成功')
      info(`Token: ${CONFIG.token.substring(0, 20)}...`)
      info(`用户ID: ${testData.userId}`)
      info(`用户昵称: ${response.data.data.userInfo.nickname}`)
      
      // 更新请求头
      client.defaults.headers['Authorization'] = `Bearer ${CONFIG.token}`
      
      return true
    } else {
      error(`登录失败: ${response.data.message}`)
      info(`提示: 请确保数据库中存在测试用户 ${testOpenid}`)
      info(`可运行: node scripts/init-db-data.js 来初始化测试数据`)
      return false
    }
  } catch (err) {
    error(`登录请求失败: ${err.message}`)
    if (err.response) {
      error(`响应状态: ${err.response.status}`)
      error(`响应数据: ${JSON.stringify(err.response.data)}`)
    }
    return false
  }
}

// ========== 步骤2：创建测试项目 ==========
async function createTestProject() {
  section('步骤2：创建测试项目')
  
  try {
    const response = await client.post('/api/projects', {
      projectName: `Word导出测试项目-${Date.now()}`,
      projectCode: `TEST-WORD-${Date.now()}`,
      organization: '测试监理机构',
      chiefEngineer: '测试总监',
      address: '测试地址-北京市朝阳区',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      description: '这是用于测试Word导出功能的测试项目'
    })
    
    if (response.data.code === 0) {
      testData.projectId = response.data.data.id
      success('项目创建成功')
      info(`项目ID: ${testData.projectId}`)
      return true
    } else {
      error(`项目创建失败: ${response.data.message}`)
      return false
    }
  } catch (err) {
    error(`项目创建请求失败: ${err.message}`)
    if (err.response) {
      error(`响应状态: ${err.response.status}`)
      error(`响应数据: ${JSON.stringify(err.response.data)}`)
    }
    return false
  }
}

// ========== 步骤3：创建测试工程 ==========
async function createTestWork() {
  section('步骤3：创建测试工程')
  
  try {
    const response = await client.post('/api/works', {
      projectId: testData.projectId,
      workName: `Word导出测试工程-${Date.now()}`,
      workCode: `WORK-TEST-${Date.now()}`,
      unitWork: '测试单位工程',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      description: '这是用于测试Word导出功能的测试工程'
    })
    
    if (response.data.code === 0) {
      testData.workId = response.data.data.id
      success('工程创建成功')
      info(`工程ID: ${testData.workId}`)
      return true
    } else {
      error(`工程创建失败: ${response.data.message}`)
      return false
    }
  } catch (err) {
    error(`工程创建请求失败: ${err.message}`)
    return false
  }
}

// ========== 步骤4：创建监理日志（完整字段） ==========
async function createTestSupervisionLog() {
  section('步骤4：创建监理日志（完整字段测试）')
  
  const logData = {
    projectId: testData.projectId,
    workId: testData.workId,
    logDate: '2024-11-08',
    weather: '晴天，气温15-25℃，东南风3-4级',
    projectDynamics: `
【施工部位】地下室二层南侧墙体、东侧柱体

【施工内容】
1. 进行地下室二层南侧墙体混凝土浇筑
2. 东侧柱体钢筋绑扎
3. 完成墙体模板支设和加固工作

【人员情况】
- 施工人员：50人（张三、李四、王五等）
- 监理人员：5人（监理A、监理B、监理C、监理D、监理E）

【设备情况】
- 挖掘机：2台
- 搅拌机：1台
- 运输车：3台
设备运行状态：正常

【材料进场】
- 混凝土C30：50方
- 钢筋HRB400：2吨
材料检验：已检验合格，材料证明齐全

【进度情况】按计划进行，明日计划进行顶板模板安装
    `.trim(),
    
    supervisionWork: `
【监理工作】
1. 对混凝土浇筑过程进行全程旁站监理
2. 检查钢筋绑扎质量，确认符合规范要求
3. 审核施工单位报送的材料合格证明文件
4. 组织召开安全专题会议

【质量管理】
发现问题：南侧墙体局部出现蜂窝现象
处理措施：要求施工单位立即凿除后重新修补，加强振捣
整改状态：已整改完成

【其他工作】
- 建设单位王经理来现场检查
- 天气良好，未影响施工进度
    `.trim(),
    
    safetyWork: `
【安全检查】
巡查范围：施工现场全区域
检查重点：高处作业、临时用电、机械设备

【发现问题】
1. 发现部分工人未正确佩戴安全帽
2. 部分脚手架扣件松动

【处理措施】
1. 立即要求整改，加强安全教育
2. 要求施工单位加固脚手架
3. 对施工班组进行安全技术交底

【整改状态】已全部整改完成

【监理意见】
施工单位基本按照规范施工，发现的质量安全问题已要求整改。建议加强过程控制，确保工程质量和施工安全。
    `.trim(),
    
    recorderName: '张三（监理工程师）',
    recorderDate: '2024-11-08',
    reviewerName: '李总监（总监理工程师）',
    reviewerDate: '2024-11-08'
  }
  
  try {
    const response = await client.post('/api/supervision-logs', logData)
    
    if (response.data.code === 0) {
      testData.logId = response.data.data.id
      success('监理日志创建成功')
      info(`日志ID: ${testData.logId}`)
      info(`包含所有字段的完整测试数据`)
      return true
    } else {
      error(`日志创建失败: ${response.data.message}`)
      return false
    }
  } catch (err) {
    error(`日志创建请求失败: ${err.message}`)
    if (err.response) {
      error(`响应数据: ${JSON.stringify(err.response.data)}`)
    }
    return false
  }
}

// ========== 步骤5：测试Word导出 ==========
async function testWordExport() {
  section('步骤5：测试Word导出')
  
  try {
    info(`正在导出日志ID: ${testData.logId}`)
    info('请求URL: ' + CONFIG.baseURL + `/api/supervision-logs/${testData.logId}/export`)
    
    const response = await client.get(`/api/supervision-logs/${testData.logId}/export`, {
      responseType: 'arraybuffer'
    })
    
    // 检查响应
    const contentType = response.headers['content-type']
    info(`响应Content-Type: ${contentType}`)
    
    if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      // 确保输出目录存在
      if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true })
      }
      
      // 保存文件
      const filename = `监理日志-云托管测试-${Date.now()}.docx`
      const filepath = path.join(CONFIG.outputDir, filename)
      fs.writeFileSync(filepath, response.data)
      
      const fileSize = fs.statSync(filepath).size
      
      success('Word文档导出成功！')
      info(`文件路径: ${filepath}`)
      info(`文件大小: ${(fileSize / 1024).toFixed(2)} KB`)
      
      return true
    } else {
      error('响应不是Word文档格式')
      // 尝试解析错误信息
      try {
        const errorData = JSON.parse(Buffer.from(response.data).toString())
        error(`错误信息: ${JSON.stringify(errorData)}`)
      } catch (e) {
        error(`响应数据（前100字节）: ${Buffer.from(response.data).toString('utf8', 0, 100)}`)
      }
      return false
    }
  } catch (err) {
    error(`Word导出失败: ${err.message}`)
    if (err.response) {
      error(`响应状态: ${err.response.status}`)
      try {
        const errorData = JSON.parse(Buffer.from(err.response.data).toString())
        error(`错误信息: ${JSON.stringify(errorData, null, 2)}`)
      } catch (e) {
        error(`响应数据: ${Buffer.from(err.response.data).toString('utf8', 0, 200)}`)
      }
    }
    return false
  }
}

// ========== 步骤6：清理测试数据 ==========
async function cleanupTestData() {
  section('步骤6：清理测试数据')
  
  try {
    // 删除监理日志
    if (testData.logId) {
      await client.delete(`/api/supervision-logs/${testData.logId}`)
      success(`删除监理日志: ${testData.logId}`)
    }
    
    // 删除工程
    if (testData.workId) {
      await client.delete(`/api/works/${testData.workId}`)
      success(`删除工程: ${testData.workId}`)
    }
    
    // 删除项目
    if (testData.projectId) {
      await client.delete(`/api/projects/${testData.projectId}`)
      success(`删除项目: ${testData.projectId}`)
    }
    
    return true
  } catch (err) {
    error(`清理测试数据失败: ${err.message}`)
    return false
  }
}

// ========== 主测试流程 ==========
async function runTests() {
  log('\n' + '█'.repeat(60), 'cyan')
  log('  云托管 Word 导出功能测试', 'bright')
  log('█'.repeat(60), 'cyan')
  
  info(`测试环境: ${CONFIG.baseURL}`)
  info(`输出目录: ${CONFIG.outputDir}`)
  log('')
  
  let testResults = {
    login: false,
    createProject: false,
    createWork: false,
    createLog: false,
    exportWord: false,
    cleanup: false
  }
  
  try {
    // 步骤1: 登录
    testResults.login = await testLogin()
    if (!testResults.login) {
      throw new Error('登录失败，终止测试')
    }
    
    // 步骤2: 创建项目
    testResults.createProject = await createTestProject()
    if (!testResults.createProject) {
      throw new Error('创建项目失败，终止测试')
    }
    
    // 步骤3: 创建工程
    testResults.createWork = await createTestWork()
    if (!testResults.createWork) {
      throw new Error('创建工程失败，终止测试')
    }
    
    // 步骤4: 创建监理日志
    testResults.createLog = await createTestSupervisionLog()
    if (!testResults.createLog) {
      throw new Error('创建监理日志失败，终止测试')
    }
    
    // 步骤5: 导出Word
    testResults.exportWord = await testWordExport()
    
    // 步骤6: 清理测试数据
    testResults.cleanup = await cleanupTestData()
    
  } catch (err) {
    error(`\n测试中断: ${err.message}`)
  }
  
  // 输出测试报告
  section('测试结果汇总')
  
  Object.entries(testResults).forEach(([key, value]) => {
    const label = {
      login: '登录认证',
      createProject: '创建项目',
      createWork: '创建工程',
      createLog: '创建日志',
      exportWord: 'Word导出',
      cleanup: '清理数据'
    }[key]
    
    if (value) {
      success(`${label}: 通过`)
    } else {
      error(`${label}: 失败`)
    }
  })
  
  log('')
  if (testResults.exportWord) {
    log('🎉 Word导出测试成功！', 'green')
  } else {
    log('⚠️  Word导出测试失败，请检查日志', 'yellow')
  }
  log('')
}

// ========== 运行测试 ==========
runTests().catch(err => {
  error(`测试运行失败: ${err.message}`)
  process.exit(1)
})


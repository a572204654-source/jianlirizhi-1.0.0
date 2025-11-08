/**
 * 调试监理日志导出数据
 * 直接查询数据库，打印完整的数据结构
 */

const axios = require('axios')

const API_BASE = 'https://api.yimengpl.com'

// ANSI颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('')
  log('━'.repeat(80), 'blue')
  log(`  ${title}`, 'yellow')
  log('━'.repeat(80), 'blue')
  console.log('')
}

async function debugExportData() {
  try {
    logSection('监理日志导出数据调试')

    // 1. 登录 - 使用测试环境的mock登录
    log('步骤1: 用户登录', 'yellow')
    const loginRes = await axios.post(`${API_BASE}/api/auth/test-login`, {
      openid: 'test_openid_001'
    })

    if (loginRes.data.code !== 0) {
      log(`❌ 登录失败: ${loginRes.data.message}`, 'red')
      return
    }

    const token = loginRes.data.data.token
    log(`✅ 登录成功`, 'green')
    log(`   Token: ${token.substring(0, 50)}...`, 'gray')
    console.log('')

    // 2. 创建测试项目
    log('步骤2: 创建测试项目', 'yellow')
    const timestamp = Date.now()
    const projectRes = await axios.post(
      `${API_BASE}/api/projects`,
      {
        projectName: `调试项目-${timestamp}`,
        projectCode: `DEBUG-${timestamp}`,
        organization: '调试监理机构',
        chiefEngineer: '李总监',
        startDate: '2024-03-01',
        endDate: '2024-09-30',
        address: '调试地点',
        description: '用于调试数据结构'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const projectId = projectRes.data.data.id
    log(`✅ 项目创建成功`, 'green')
    log(`   项目ID: ${projectId}`, 'gray')
    log(`   项目名称: ${projectRes.data.data.project_name}`, 'gray')
    log(`   项目编号: ${projectRes.data.data.project_code}`, 'gray')
    log(`   监理机构: 调试监理机构`, 'gray')
    log(`   总监: 李总监`, 'gray')
    log(`   起止时间: 2024-03-01 至 2024-09-30`, 'gray')
    console.log('')

    // 3. 创建测试工程
    log('步骤3: 创建测试工程', 'yellow')
    const workRes = await axios.post(
      `${API_BASE}/api/works`,
      {
        projectId: projectId,
        workName: `调试单项工程-${timestamp}`,
        workCode: `WORK-DEBUG-${timestamp}`,
        unitWork: '调试单位工程名称',
        description: '用于调试'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const workId = workRes.data.data.id
    log(`✅ 工程创建成功`, 'green')
    log(`   工程ID: ${workId}`, 'gray')
    log(`   单项工程名称: ${workRes.data.data.work_name}`, 'gray')
    log(`   单项工程编号: ${workRes.data.data.work_code}`, 'gray')
    log(`   单位工程名称: ${workRes.data.data.unit_work}`, 'gray')
    console.log('')

    // 4. 创建监理日志
    log('步骤4: 创建监理日志', 'yellow')
    const logRes = await axios.post(
      `${API_BASE}/api/supervision-logs`,
      {
        projectId: projectId,
        workId: workId,
        logDate: '2024-06-20',
        weatherAm: '晴',
        weatherPm: '多云',
        tempAm: '25',
        tempPm: '28',
        workContent: '调试工作内容',
        supervisionRecord: '调试监理记录',
        supervisionNote: '调试监理备注'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const logId = logRes.data.data.id
    log(`✅ 监理日志创建成功`, 'green')
    log(`   日志ID: ${logId}`, 'gray')
    console.log('')

    // 5. 获取监理日志详情（模拟导出前的查询）
    logSection('步骤5: 查询监理日志详情（模拟导出查询）')
    
    const detailRes = await axios.get(
      `${API_BASE}/api/supervision-logs/${logId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const logData = detailRes.data.data
    
    log('✅ 查询成功，以下是完整的数据结构：', 'green')
    console.log('')
    
    // 打印完整的JSON数据
    log('【完整JSON数据】', 'yellow')
    console.log(JSON.stringify(logData, null, 2))
    console.log('')

    // 分析关键字段
    logSection('关键字段分析')
    
    const fields = [
      { label: '项目名称', keys: ['project_name', 'projectName'], value: logData.project_name || logData.projectName },
      { label: '项目编号', keys: ['project_code', 'projectCode'], value: logData.project_code || logData.projectCode },
      { label: '单项工程名称', keys: ['work_name', 'workName'], value: logData.work_name || logData.workName },
      { label: '单项工程编号', keys: ['work_code', 'workCode'], value: logData.work_code || logData.workCode },
      { label: '单位工程名称', keys: ['unit_work', 'unitWork'], value: logData.unit_work || logData.unitWork },
      { label: '监理机构', keys: ['organization'], value: logData.organization },
      { label: '总监理工程师', keys: ['chief_engineer', 'chiefEngineer'], value: logData.chief_engineer || logData.chiefEngineer },
      { label: '项目开始日期', keys: ['project_start_date', 'projectStartDate', 'start_date', 'startDate'], value: logData.project_start_date || logData.projectStartDate || logData.start_date || logData.startDate },
      { label: '项目结束日期', keys: ['project_end_date', 'projectEndDate', 'end_date', 'endDate'], value: logData.project_end_date || logData.projectEndDate || logData.end_date || logData.endDate }
    ]

    fields.forEach(field => {
      const status = field.value ? '✅' : '❌'
      const color = field.value ? 'green' : 'red'
      log(`${status} ${field.label}:`, color)
      log(`   可能的字段名: ${field.keys.join(', ')}`, 'gray')
      log(`   实际值: ${field.value || '【缺失】'}`, field.value ? 'blue' : 'red')
      console.log('')
    })

    // 6. 清理测试数据
    logSection('步骤6: 清理测试数据')
    
    await axios.delete(`${API_BASE}/api/supervision-logs/${logId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    log(`✅ 删除监理日志: ${logId}`, 'green')

    await axios.delete(`${API_BASE}/api/works/${workId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    log(`✅ 删除工程: ${workId}`, 'green')

    await axios.delete(`${API_BASE}/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    log(`✅ 删除项目: ${projectId}`, 'green')

    logSection('调试完成')
    log('🎉 数据结构分析完成！', 'green')
    log('📋 请查看上面的字段分析，确认哪些字段缺失', 'yellow')

  } catch (error) {
    console.error('')
    log('❌ 发生错误:', 'red')
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error.message)
    }
  }
}

// 运行调试
debugExportData()


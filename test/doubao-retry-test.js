/**
 * 豆包API重试测试
 * 针对超时场景进行重试测试
 */

const { optimizeSupervisionLog, getAISuggestion } = require('../utils/doubao')

async function retryTest() {
  console.log('='.repeat(60))
  console.log('豆包API重试测试')
  console.log('='.repeat(60))
  console.log()

  // 测试监理日志优化（增加超时时间）
  console.log('【重试测试1】监理日志优化（60秒超时）')
  console.log('-'.repeat(60))
  try {
    const testLog = '今天施工进度正常'
    const startTime = Date.now()
    const response = await optimizeSupervisionLog(testLog)
    const endTime = Date.now()
    
    console.log('✅ 测试通过')
    console.log(`响应时间: ${endTime - startTime}ms`)
    console.log('原始日志:', testLog)
    console.log('优化后:', response.substring(0, 200) + '...')
    console.log()
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log()
  }

  // 等待2秒再测试
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 测试AI建议（增加超时时间）
  console.log('【重试测试2】AI建议获取（60秒超时）')
  console.log('-'.repeat(60))
  try {
    const startTime = Date.now()
    const response = await getAISuggestion(
      '钢筋验收的主要要点有哪些？'
    )
    const endTime = Date.now()
    
    console.log('✅ 测试通过')
    console.log(`响应时间: ${endTime - startTime}ms`)
    console.log('AI建议:', response.substring(0, 200) + '...')
    console.log()
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log()
  }

  console.log('='.repeat(60))
  console.log('重试测试完成')
  console.log('='.repeat(60))
}

retryTest().catch(error => {
  console.error('测试执行出错:', error)
  process.exit(1)
})


/**
 * 豆包API测试脚本
 * 用于验证豆包AI服务是否正常工作
 */

const { 
  chatWithDoubao, 
  chatWithContext, 
  optimizeSupervisionLog,
  getAISuggestion 
} = require('../utils/doubao')

// 测试用例
async function runTests() {
  console.log('='.repeat(60))
  console.log('开始测试豆包API')
  console.log('='.repeat(60))
  console.log()

  // 测试1: 简单对话
  console.log('【测试1】简单对话测试')
  console.log('-'.repeat(60))
  try {
    const startTime = Date.now()
    const response = await chatWithDoubao('你好，请简单介绍一下你自己')
    const endTime = Date.now()
    
    console.log('✅ 测试通过')
    console.log(`响应时间: ${endTime - startTime}ms`)
    console.log('AI回复:', response)
    console.log()
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log()
  }

  // 测试2: 监理日志优化
  console.log('【测试2】监理日志优化测试')
  console.log('-'.repeat(60))
  try {
    const testLog = '今天天气不错，施工进度正常，没什么问题'
    const startTime = Date.now()
    const response = await optimizeSupervisionLog(testLog)
    const endTime = Date.now()
    
    console.log('✅ 测试通过')
    console.log(`响应时间: ${endTime - startTime}ms`)
    console.log('原始日志:', testLog)
    console.log('优化后:', response)
    console.log()
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log()
  }

  // 测试3: 多轮对话
  console.log('【测试3】多轮对话测试')
  console.log('-'.repeat(60))
  try {
    const conversationHistory = [
      { role: 'user', content: '我是一名工程监理' },
      { role: 'assistant', content: '您好！很高兴为您服务。作为工程监理，您在项目中扮演着重要的角色。请问有什么我可以帮助您的吗？' }
    ]
    
    const startTime = Date.now()
    const response = await chatWithContext(conversationHistory, '请问监理日志应该包含哪些内容？')
    const endTime = Date.now()
    
    console.log('✅ 测试通过')
    console.log(`响应时间: ${endTime - startTime}ms`)
    console.log('AI回复:', response)
    console.log()
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log()
  }

  // 测试4: AI建议获取
  console.log('【测试4】AI建议获取测试')
  console.log('-'.repeat(60))
  try {
    const startTime = Date.now()
    const response = await getAISuggestion(
      '混凝土浇筑时遇到下雨天气应该怎么处理？',
      '项目类型：商业综合体，当前施工阶段：主体结构'
    )
    const endTime = Date.now()
    
    console.log('✅ 测试通过')
    console.log(`响应时间: ${endTime - startTime}ms`)
    console.log('AI建议:', response)
    console.log()
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log()
  }

  console.log('='.repeat(60))
  console.log('测试完成')
  console.log('='.repeat(60))
}

// 执行测试
runTests().catch(error => {
  console.error('测试执行出错:', error)
  process.exit(1)
})


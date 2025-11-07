/**
 * 🔧 调试版 - Word导出功能
 * 
 * 用途：查看后端返回的详细错误信息
 * 使用方法：临时替换正式版，查看错误详情后再换回来
 * 
 * 重要：这个版本会先用 request 获取错误详情，成功后再用 downloadFile 下载
 */

const config = {
  // ⚠️ 修改为你的后端地址
  baseUrl: 'https://your-domain.com',
  
  // ⚠️ 如果token存储位置不同，请修改
  tokenKey: 'token'
}

/**
 * 获取token
 */
function getToken() {
  const token = wx.getStorageSync(config.tokenKey)
  if (!token) {
    console.error('❌ 未找到token，请先登录')
    return null
  }
  return token
}

/**
 * 步骤1：先用 request 检查接口是否正常
 * 这样可以看到后端的详细错误信息
 */
function checkApi(logId) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    if (!token) {
      reject(new Error('未登录'))
      return
    }

    const url = `${config.baseUrl}/api/supervision-logs/${logId}/export`
    
    console.log('🔍 步骤1：检查API接口')
    console.log('📍 URL:', url)
    console.log('🔑 Token:', token.substring(0, 20) + '...')

    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'arraybuffer', // 期望返回二进制数据
      success: (res) => {
        console.log('📥 步骤1结果：', {
          statusCode: res.statusCode,
          header: res.header
        })

        if (res.statusCode === 200) {
          console.log('✅ 接口正常，准备下载')
          resolve()
        } else {
          // 尝试解析错误信息
          try {
            // 如果返回的是JSON错误
            const decoder = new TextDecoder('utf-8')
            const text = decoder.decode(new Uint8Array(res.data))
            console.error('❌ 服务器返回错误:', text)
            
            try {
              const json = JSON.parse(text)
              reject(new Error(json.message || `服务器错误: ${res.statusCode}`))
            } catch (e) {
              reject(new Error(text || `服务器错误: ${res.statusCode}`))
            }
          } catch (e) {
            console.error('❌ 解析错误响应失败:', e)
            reject(new Error(`服务器错误: ${res.statusCode}`))
          }
        }
      },
      fail: (err) => {
        console.error('❌ 步骤1失败:', err)
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

/**
 * 步骤2：使用 downloadFile 下载文件
 */
function downloadFile(logId) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    if (!token) {
      reject(new Error('未登录'))
      return
    }

    const url = `${config.baseUrl}/api/supervision-logs/${logId}/export`
    
    console.log('📥 步骤2：开始下载文件')
    
    wx.showLoading({ title: '正在下载...' })

    const downloadTask = wx.downloadFile({
      url: url,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        wx.hideLoading()
        
        console.log('📥 下载完成:', {
          statusCode: res.statusCode,
          tempFilePath: res.tempFilePath
        })

        if (res.statusCode === 200) {
          console.log('✅ 文件下载成功')
          resolve(res.tempFilePath)
        } else {
          console.error('❌ 下载失败，状态码:', res.statusCode)
          reject(new Error(`下载失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('❌ 下载失败:', err)
        reject(new Error(err.errMsg || '下载失败'))
      }
    })

    // 监听下载进度
    downloadTask.onProgressUpdate((res) => {
      console.log(`📊 下载进度: ${res.progress}%`)
      wx.showLoading({
        title: `下载中 ${res.progress}%`
      })
    })
  })
}

/**
 * 步骤3：打开文件
 */
function openFile(filePath) {
  return new Promise((resolve, reject) => {
    console.log('📄 步骤3：打开文件')
    
    wx.openDocument({
      filePath: filePath,
      fileType: 'docx',
      showMenu: true,
      success: () => {
        console.log('✅ 文件打开成功')
        wx.showToast({
          title: '导出成功',
          icon: 'success'
        })
        resolve()
      },
      fail: (err) => {
        console.error('❌ 打开文件失败:', err)
        // 打开失败不影响主流程，文件已经下载成功
        wx.showToast({
          title: '文件已下载',
          icon: 'success'
        })
        resolve()
      }
    })
  })
}

/**
 * 完整的导出流程
 */
async function exportWord(logId) {
  try {
    console.log('==========================================')
    console.log('🚀 开始Word导出调试流程')
    console.log('📋 日志ID:', logId)
    console.log('==========================================')

    // 参数验证
    if (!logId) {
      throw new Error('日志ID不能为空')
    }

    // 步骤1：检查API接口（会显示详细错误）
    await checkApi(logId)

    // 步骤2：下载文件
    const filePath = await downloadFile(logId)

    // 步骤3：打开文件
    await openFile(filePath)

    console.log('==========================================')
    console.log('✅ Word导出调试流程完成')
    console.log('==========================================')

    return filePath

  } catch (error) {
    console.log('==========================================')
    console.error('❌ Word导出失败')
    console.error('错误详情:', error)
    console.log('==========================================')

    wx.hideLoading()
    
    // 显示详细的错误提示
    let errorMsg = '导出失败'
    if (error.message) {
      errorMsg = error.message
    }

    wx.showModal({
      title: '导出失败',
      content: errorMsg,
      showCancel: false,
      confirmText: '我知道了'
    })

    throw error
  }
}

/**
 * 🔍 测试连接性
 * 用于测试后端连接是否正常
 */
async function testConnection() {
  try {
    console.log('🔍 测试后端连接...')
    
    const token = getToken()
    if (!token) {
      throw new Error('未登录')
    }

    // 测试一个简单的接口（如获取用户信息）
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${config.baseUrl}/api/auth/profile`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          console.log('✅ 后端连接正常:', res)
          resolve(res)
        },
        fail: (err) => {
          console.error('❌ 后端连接失败:', err)
          reject(err)
        }
      })
    })

    wx.showToast({
      title: '连接正常',
      icon: 'success'
    })

    return result

  } catch (error) {
    console.error('❌ 连接测试失败:', error)
    
    wx.showModal({
      title: '连接失败',
      content: error.message || '无法连接到后端服务器',
      showCancel: false
    })

    throw error
  }
}

module.exports = {
  exportWord,
  testConnection
}


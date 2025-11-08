/**
 * 和风天气API - 简化版
 * 只返回核心天气数据：天气、气温、风向、风力
 */

const { getWeatherNow, getWeatherDaily } = require('./qweather')

/**
 * 获取简化的天气信息
 * @param {string} location - 位置（经纬度格式 "116.41,39.92" 或城市ID）
 * @returns {Object} 简化的天气数据
 */
async function getSimpleWeather(location) {
  try {
    // 并行请求实时天气和今日预报
    const [nowResult, dailyResult] = await Promise.all([
      getWeatherNow(location),
      getWeatherDaily(location, 1) // 只获取今天的预报
    ])

    // 检查请求是否成功
    if (!nowResult.success || !dailyResult.success) {
      throw new Error('获取天气数据失败')
    }

    const now = nowResult.data
    const today = dailyResult.data[0]

    // 组装简化的天气数据
    const simpleWeather = {
      // 天气状况
      weather: now.text || '未知',
      
      // 气温范围（今日最低~最高）
      tempMin: today.tempMin || '--',
      tempMax: today.tempMax || '--',
      tempRange: `${today.tempMin || '--'}~${today.tempMax || '--'}℃`,
      
      // 当前温度
      tempNow: now.temp || '--',
      
      // 风向（取当前风向）
      windDir: now.windDir || '未知',
      
      // 风力范围（今日）
      windScale: today.windScaleDay || '--',
      
      // 更新时间
      updateTime: now.obsTime || new Date().toISOString()
    }

    return {
      success: true,
      data: simpleWeather
    }
  } catch (error) {
    console.error('获取简化天气数据错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 格式化显示天气信息（类似图片中的格式）
 * @param {string} location - 位置
 * @returns {Object} 格式化的天气文本
 */
async function getWeatherDisplay(location) {
  try {
    const result = await getSimpleWeather(location)
    
    if (!result.success) {
      return {
        success: false,
        error: result.error
      }
    }

    const data = result.data

    // 格式化为显示文本
    const displayText = `天气：${data.weather}    气温：${data.tempRange}  风向：${data.windDir}  风力：${data.windScale}级`

    return {
      success: true,
      data: data,
      displayText: displayText
    }
  } catch (error) {
    console.error('格式化天气显示错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

module.exports = {
  getSimpleWeather,
  getWeatherDisplay
}


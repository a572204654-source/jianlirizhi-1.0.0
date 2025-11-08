/**
 * 天气路由 - 简化版
 * 只返回核心天气数据：天气、气温、风向、风力
 */

const express = require('express')
const router = express.Router()
const { getSimpleWeather, getWeatherDisplay } = require('../utils/qweather-simple')
const { success, badRequest, serverError } = require('../utils/response')

/**
 * 获取简化天气信息
 * GET /api/weather/simple
 * 
 * 请求参数:
 * - location: 位置（经纬度 "116.41,39.92" 或城市ID）
 * 
 * 返回数据:
 * {
 *   weather: "阴",           // 天气状况
 *   tempRange: "12~26℃",     // 温度范围
 *   tempMin: "12",           // 最低温度
 *   tempMax: "26",           // 最高温度
 *   tempNow: "15",           // 当前温度
 *   windDir: "偏西",         // 风向
 *   windScale: "2-3",        // 风力等级
 *   updateTime: "..."        // 更新时间
 * }
 */
router.get('/simple', async (req, res) => {
  try {
    const { location } = req.query

    // 参数验证
    if (!location) {
      return badRequest(res, '缺少location参数')
    }

    // 获取简化天气数据
    const result = await getSimpleWeather(location)

    if (!result.success) {
      return serverError(res, result.error || '获取天气数据失败')
    }

    return success(res, result.data, '获取天气成功')
  } catch (error) {
    console.error('获取简化天气错误:', error)
    return serverError(res, error.message || '获取天气失败')
  }
})

/**
 * 获取格式化的天气显示文本
 * GET /api/weather/display
 * 
 * 请求参数:
 * - location: 位置（经纬度 "116.41,39.92" 或城市ID）
 * 
 * 返回数据:
 * {
 *   data: { ... },                                    // 完整天气数据
 *   displayText: "天气：阴 气温：12~26℃ 风向：偏西 风力：2-3级"  // 格式化文本
 * }
 */
router.get('/display', async (req, res) => {
  try {
    const { location } = req.query

    // 参数验证
    if (!location) {
      return badRequest(res, '缺少location参数')
    }

    // 获取格式化天气数据
    const result = await getWeatherDisplay(location)

    if (!result.success) {
      return serverError(res, result.error || '获取天气数据失败')
    }

    return success(res, {
      data: result.data,
      displayText: result.displayText
    }, '获取天气成功')
  } catch (error) {
    console.error('获取格式化天气错误:', error)
    return serverError(res, error.message || '获取天气失败')
  }
})

module.exports = router


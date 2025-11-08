# 天气API - /current 接口修复说明

## 问题描述

小程序调用 `/api/weather/current` 接口时返回 **404 Not Found** 错误。

### 错误信息
```
GET https://api.yimengpl.com/api/weather/current?latitude=35.6833&longitude=139.75 404 (Not Found)
获取气象失败： Error: 请求的资源不存在
```

## 问题原因

1. **路由缺失**: `routes/weather.js` 中没有定义 `/current` 路由
2. **路径不一致**: 
   - 文档和测试中引用了 `/api/weather/current` 接口
   - 但只有 `/api/v1/weather/current` 路由存在（需要认证）
   - 实际需要的 `/api/weather/current` 路由不存在

## 解决方案

在 `routes/weather.js` 中新增 `/current` 路由，提供与 `/api/v1/weather/current` 相同的功能。

### 新增接口

**接口地址**: `GET /api/weather/current`

**请求参数**:
- `latitude` - 纬度（必需，范围：-90 到 90）
- `longitude` - 经度（必需，范围：-180 到 180）

**返回数据**:
```json
{
  "code": 0,
  "message": "获取气象信息成功",
  "data": {
    "weather": "阴，12-26℃",
    "weatherText": "阴",
    "temperature": 15,
    "temperatureMin": 12,
    "temperatureMax": 26,
    "humidity": 65,
    "windDirection": "偏西",
    "windScale": "2",
    "updateTime": "2024-11-08T10:00:00+08:00"
  },
  "timestamp": 1699200000000
}
```

### 主要功能

1. ✅ **参数验证**: 验证经纬度参数的完整性和有效性
2. ✅ **并发请求**: 同时获取实时天气和3天预报数据
3. ✅ **数据组合**: 将实时天气和预报数据组合成统一格式
4. ✅ **错误处理**: 完善的错误处理和错误消息
5. ✅ **无需认证**: 不需要JWT token，方便调用

### 代码实现

接口实现位于 `routes/weather.js` 第 40-98 行，主要逻辑：

```javascript
router.get('/current', async (req, res) => {
  // 1. 参数验证
  const { latitude, longitude } = req.query
  
  // 2. 转换坐标格式（和风天气需要：经度,纬度）
  const location = `${longitude},${latitude}`
  
  // 3. 并发请求实时天气和预报
  const [nowResult, dailyResult] = await Promise.all([
    getWeatherNow(location),
    getWeatherDaily(location, 3)
  ])
  
  // 4. 组合数据并返回
  const weatherData = {
    weather: `${now.text}，${forecast.tempMin}-${forecast.tempMax}℃`,
    // ... 其他字段
  }
  
  return success(res, weatherData, '获取气象信息成功')
})
```

## 修复的技术问题

### 1. 数据结构处理

修正了从 `qweather.js` 工具函数返回的数据结构处理：

**错误写法**:
```javascript
const now = nowResult.data.now        // ❌ 错误
const forecast = dailyResult.data.daily[0]  // ❌ 错误
```

**正确写法**:
```javascript
const now = nowResult.data            // ✅ 正确
const forecast = dailyResult.data[0]  // ✅ 正确
```

**原因**: 
- `getWeatherNow()` 返回 `{ success: true, data: <now对象> }`
- `getWeatherDaily()` 返回 `{ success: true, data: <daily数组> }`
- 所以 `data` 字段本身就是目标数据，不需要再访问子属性

## 部署更新

### 1. 本地测试

```bash
# 启动服务
npm start

# 运行测试脚本
node test-weather-current.js
```

### 2. 部署到云托管

```bash
# 提交代码
git add routes/weather.js
git commit -m "修复: 添加 /api/weather/current 接口"
git push

# 触发云托管自动部署
# 或者手动部署
```

### 3. 验证部署

部署完成后，测试接口：

```bash
# 使用curl测试
curl "https://api.yimengpl.com/api/weather/current?latitude=35.6833&longitude=139.75"

# 或者使用浏览器访问
https://api.yimengpl.com/api/weather/current?latitude=39.92&longitude=116.41
```

## 小程序调用示例

### 方式1：使用API模块（推荐）

如果小程序使用 `miniapp-example/api.js` 中的API模块：

```javascript
import api from '@/utils/api.js'

// 获取当前位置的天气
async function getWeather() {
  try {
    const location = await wx.getLocation({ type: 'gcj02' })
    const result = await api.weather.getCurrent(
      location.latitude,
      location.longitude
    )
    console.log('天气信息:', result.data)
  } catch (error) {
    console.error('获取天气失败:', error)
  }
}
```

### 方式2：直接请求

```javascript
// 获取当前位置
wx.getLocation({
  type: 'gcj02',
  success: (location) => {
    // 调用天气接口
    wx.request({
      url: 'https://api.yimengpl.com/api/weather/current',
      method: 'GET',
      data: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      success: (res) => {
        if (res.data.code === 0) {
          console.log('天气:', res.data.data.weather)
          console.log('温度:', res.data.data.temperature)
        }
      }
    })
  }
})
```

## 相关接口对比

项目中现在有三个天气接口路径：

### 1. `/api/weather/current` ✨ 新增

- **用途**: 快速获取天气信息（实时+预报）
- **认证**: 不需要
- **参数**: latitude, longitude
- **返回**: 组合后的天气数据
- **适用**: 小程序直接调用

### 2. `/api/v1/weather/current` 

- **用途**: 获取当前气象（支持缓存）
- **认证**: 需要JWT token
- **参数**: latitude, longitude
- **返回**: 详细气象数据
- **适用**: 需要认证的场景

### 3. `/api/weather/now`

- **用途**: 获取实时天气
- **认证**: 不需要
- **参数**: location（经纬度或城市ID）
- **返回**: 和风天气原始格式
- **适用**: 需要实时数据的场景

## 注意事项

1. ✅ **环境变量**: 确保和风天气的环境变量已正确配置
   - `QWEATHER_KEY_ID`
   - `QWEATHER_PROJECT_ID`
   - `QWEATHER_PRIVATE_KEY`

2. ✅ **坐标系**: 
   - 小程序 `wx.getLocation()` 返回的是 GCJ-02 坐标
   - 和风天气API支持 GCJ-02 坐标
   - 无需坐标转换

3. ✅ **频率限制**: 和风天气API有调用频率限制，建议：
   - 在小程序端做数据缓存
   - 避免频繁调用
   - 考虑添加服务端缓存

4. ✅ **错误处理**: 接口包含完整的错误处理
   - 参数验证
   - API调用失败处理
   - 友好的错误消息

## 测试结果

### 参数验证测试

✅ 缺少经度 → 返回 400 "经纬度参数不能为空"
✅ 无效纬度 → 返回 400 "经纬度参数超出有效范围"
✅ 参数格式错误 → 返回 400 "经纬度参数格式不正确"

### 功能测试

✅ 东京天气 (35.6833, 139.75) → 正常返回
✅ 北京天气 (39.92, 116.41) → 正常返回
✅ 返回数据格式符合预期
✅ 所有必需字段都存在

## 后续优化建议

1. **添加缓存**: 考虑使用 Redis 或 node-cache 缓存天气数据
2. **降级策略**: 和风天气API失败时，返回模拟数据或缓存数据
3. **监控告警**: 添加接口调用监控和失败告警
4. **批量查询**: 如果需要多个地点的天气，考虑批量接口

## 相关文件

- `routes/weather.js` - 天气路由（包含新增接口）
- `utils/qweather.js` - 和风天气API工具
- `utils/qweather-jwt.js` - 和风天气JWT认证
- `test-weather-current.js` - 接口测试脚本
- `miniapp-example/api.js` - 小程序API模块

---

**修复时间**: 2024-11-08
**修复人员**: AI助手
**影响范围**: 新增接口，不影响现有功能
**测试状态**: 待部署后验证


# ✅ 和风天气 JWT 认证配置完成

## 🎉 配置状态

**JWT 认证已成功配置并测试通过！**

---

## 📋 完整配置信息

### 1. JWT 凭据
```
凭据ID (kid):    TCWHA45GD4
项目ID (sub):    288AH4E373
API Host:        https://ma4bjadbw4.re.qweatherapi.com
```

### 2. 环境变量配置 (.env)
```env
# 和风天气配置（JWT认证）
QWEATHER_KEY_ID=TCWHA45GD4
QWEATHER_PROJECT_ID=288AH4E373
QWEATHER_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIBZXM81ByGars3XTLQzTtcjhbwYCJAlGNgdlvedZMLFZ\n-----END PRIVATE KEY-----\n
QWEATHER_API_HOST=https://ma4bjadbw4.re.qweatherapi.com
```

### 3. 私钥文件
- 路径: `ed25519-private.pem`
- 类型: Ed25519 私钥
- 用途: 本地开发环境备用（优先使用环境变量）

---

## ✅ 测试结果

### 成功的 API
- ✅ **实时天气 API** (`/v7/weather/now`)
  - 测试位置: 北京
  - 返回数据: 温度、天气、湿度等
  
- ✅ **7天天气预报 API** (`/v7/weather/7d`)
  - 测试位置: 北京
  - 返回数据: 未来7天的天气预报

### 可用的 API 接口
```javascript
const qweather = require('./utils/qweather')

// 1. 获取实时天气
await qweather.getWeatherNow('101010100')  // 北京城市ID

// 2. 获取天气预报
await qweather.getWeatherDaily('101010100', 7)  // 7天预报

// 3. 获取逐小时预报
await qweather.getWeatherHourly('101010100', 24)  // 24小时预报

// 4. 获取空气质量
await qweather.getAirQuality('101010100')

// 5. 获取天气预警
await qweather.getWeatherWarning('101010100')

// 6. 获取生活指数
await qweather.getWeatherIndices('101010100')

// 7. 获取综合天气信息（一次性获取多种数据）
await qweather.getWeatherComprehensive('101010100')
```

---

## 🚀 使用方式

### 在路由中使用

```javascript
const express = require('express')
const router = express.Router()
const { getWeatherNow, getWeatherDaily } = require('../utils/qweather')
const { success, serverError } = require('../utils/response')

/**
 * 获取实时天气
 * GET /api/weather/now?location=101010100
 */
router.get('/now', async (req, res) => {
  try {
    const { location } = req.query
    
    if (!location) {
      return badRequest(res, '缺少location参数')
    }
    
    const result = await getWeatherNow(location)
    
    if (result.success) {
      return success(res, result.data, '获取成功')
    } else {
      return serverError(res, result.error)
    }
  } catch (error) {
    console.error('获取实时天气失败:', error)
    return serverError(res, '获取天气失败')
  }
})

/**
 * 获取天气预报
 * GET /api/weather/forecast?location=101010100&days=7
 */
router.get('/forecast', async (req, res) => {
  try {
    const { location, days = 7 } = req.query
    
    if (!location) {
      return badRequest(res, '缺少location参数')
    }
    
    const result = await getWeatherDaily(location, parseInt(days))
    
    if (result.success) {
      return success(res, result.data, '获取成功')
    } else {
      return serverError(res, result.error)
    }
  } catch (error) {
    console.error('获取天气预报失败:', error)
    return serverError(res, '获取预报失败')
  }
})

module.exports = router
```

---

## 🔐 JWT Token 生成流程

### 自动生成机制
项目会自动生成和缓存 JWT Token：

1. **首次调用时生成**
   - 使用 Ed25519 私钥签名
   - Token 有效期: 1小时

2. **自动缓存和刷新**
   - Token 缓存在内存中
   - 过期前自动生成新 Token

3. **私钥读取优先级**
   - 优先: 环境变量 `QWEATHER_PRIVATE_KEY`（云托管）
   - 备用: 私钥文件 `ed25519-private.pem`（本地开发）

### Token 格式示例
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsImtpZCI6IlRDV0hBNDVHRDQifQ
.eyJzdWIiOiIyODhBSDRFMzczIiwiaWF0IjoxNzYyNjA2MDk2LCJleHAiOjE3NjI2MDk2OTZ9
.dApiBSSWb6_7zdERE1UUlUxTD6CZQGfJd6J4uSa8WPitgt9t1rfXrM83HNONAEtrohyAQh9gYHMyV2Buru8VDg
```

---

## 📍 城市 Location ID

### 获取城市 ID 的方法

#### 方法 1：使用和风天气城市列表
下载: https://dev.qweather.com/docs/resource/location-list/

#### 方法 2：常用城市 ID
```javascript
const CITY_IDS = {
  '北京': '101010100',
  '上海': '101020100',
  '广州': '101280101',
  '深圳': '101280601',
  '杭州': '101210101',
  '成都': '101270101',
  '西安': '101110101',
  '武汉': '101200101',
  '南京': '101190101',
  '重庆': '101040100'
}
```

#### 方法 3：使用经纬度
```javascript
// 也可以直接使用经纬度（格式：经度,纬度）
await getWeatherNow('116.41,39.92')  // 北京天安门
```

---

## 🔧 配置文件结构

### config/index.js
```javascript
qweather: {
  // JWT认证配置
  keyId: process.env.QWEATHER_KEY_ID || '',
  projectId: process.env.QWEATHER_PROJECT_ID || '',
  privateKey: process.env.QWEATHER_PRIVATE_KEY || '',
  // API Host（专属域名，JWT认证必需）
  apiHost: process.env.QWEATHER_API_HOST || 'https://ma4bjadbw4.re.qweatherapi.com',
  timeout: 8000,
  cacheTime: 300 // 缓存5分钟
}
```

---

## 🔒 安全说明

### 1. 私钥保护
- ⚠️ **切勿将私钥文件提交到代码仓库！**
- ✅ 已添加到 `.gitignore`: `ed25519-private.pem`
- ✅ 生产环境使用环境变量

### 2. 环境变量格式
```env
# .env 文件中使用 \n 表示换行
QWEATHER_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# 云托管控制台中可能需要使用 <br> 表示换行
QWEATHER_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----<br>...<br>-----END PRIVATE KEY-----<br>
```

### 3. Token 有效期
- 每个 Token 有效期: 1小时
- 建议在到期前 5-10 分钟刷新

---

## 📦 依赖包

确保已安装以下依赖：

```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "jose": "^5.2.0"
  }
}
```

---

## 🐛 常见问题

### Q1: 为什么城市搜索 API 返回 404？
**A:** 城市搜索 API (`/v2/city/lookup`) 可能不在你的订阅计划中，建议直接使用城市 ID。

### Q2: 如何在云托管环境配置私钥？
**A:** 
1. 进入云托管控制台
2. 配置环境变量
3. 添加 `QWEATHER_PRIVATE_KEY`
4. 值格式: `-----BEGIN PRIVATE KEY-----<br>...<br>-----END PRIVATE KEY-----<br>`

### Q3: Token 验证失败怎么办？
**A:** 
1. 检查私钥格式是否正确
2. 确认凭据ID (kid) 是否匹配
3. 在控制台的"JWT验证"页面测试

### Q4: API 返回 403 Invalid Host？
**A:** 
1. 确认 `QWEATHER_API_HOST` 配置正确
2. 使用你的专属域名（不是公共域名）
3. 格式: `https://xxxxxx.qweatherapi.com`

---

## 📝 下一步建议

### 1. 创建天气路由
在 `routes/` 目录创建 `weather.js`，提供天气查询接口

### 2. 添加缓存机制
天气数据变化不频繁，建议缓存 5-10 分钟

### 3. 错误处理优化
针对不同的 API 错误码返回友好提示

### 4. 添加数据格式化
将和风天气返回的数据格式化为更适合小程序使用的格式

---

## 🔗 参考文档

- [和风天气开发文档](https://dev.qweather.com/docs/)
- [JWT 认证说明](https://dev.qweather.com/docs/configuration/authentication/#json-web-token)
- [API Host 配置](https://dev.qweather.com/docs/configuration/api-host/)
- [天气 API 列表](https://dev.qweather.com/docs/api/)

---

**配置完成时间**: 2025-11-08  
**测试状态**: ✅ 成功  
**环境**: 开发环境（本地测试通过）

🎉 恭喜！和风天气 JWT 认证配置完成，可以开始开发天气相关功能了！


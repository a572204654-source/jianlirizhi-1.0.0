# 🔧 天气 API 路由修复说明

## 问题描述

小程序调用天气 API 时出现 **404 Not Found** 错误：

```
GET https://api.yimengpl.com/api/v1/weather/current?latitude=35.6833&longitude=139.75
返回：404 (Not Found)
错误信息：请求的资源不存在
```

## 问题原因

1. **前端请求路径**：`/api/v1/weather/current`
2. **后端注册路径**：
   - `/api/weather/*` ✅ 已注册
   - `/api/v1/weather/*` ❌ 未注册

虽然 `routes/v1/weather.js` 文件存在并定义了 `/current` 接口，但在 `app.js` 中**没有注册**该路由模块。

## 修复方案

### 修改内容

**文件：`app.js`**

1. **引入 v1 天气路由模块**：
```javascript
// 天气路由
var weatherRouter = require('./routes/weather');
var weatherSimpleRouter = require('./routes/weather-simple');
var weatherV1Router = require('./routes/v1/weather'); // ✅ 新增
```

2. **注册 v1 路由**：
```javascript
// 天气API路由
app.use('/api/weather', weatherRouter);
app.use('/api/weather', weatherSimpleRouter);
app.use('/api/v1/weather', weatherV1Router); // ✅ 新增
```

## API 接口说明

### v1 版本天气 API（简化版）

#### 获取当前天气
```
GET /api/v1/weather/current
```

**请求参数：**
- `latitude`：纬度（必需）
- `longitude`：经度（必需）

**请求头：**
```
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "weather": "晴，15-25℃",
    "weatherText": "晴",
    "temperature": 20,
    "temperatureMin": 15,
    "temperatureMax": 25,
    "humidity": 60,
    "windDirection": "东南风",
    "windScale": "3",
    "updateTime": "2024-11-08T10:30:00+08:00"
  },
  "timestamp": 1699419000000
}
```

**特点：**
- ✅ 自动调用和风天气 API（如果配置了 `QWEATHER_API_KEY`）
- ✅ API 失败时自动降级为模拟数据
- ✅ 5 分钟缓存，减少 API 调用
- ✅ 需要登录认证（authenticate 中间件）

### 旧版天气 API（完整版）

#### 获取实时天气
```
GET /api/weather/now
```

**请求参数：**
- `location`：位置（格式：`经度,纬度`，如 `116.4074,39.9042`）

**请求头：**
```
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "now": {
      "obsTime": "2024-11-08T10:30:00+08:00",
      "temp": "20",
      "feelsLike": "19",
      "text": "晴",
      "wind360": "135",
      "windDir": "东南风",
      "windScale": "3",
      "windSpeed": "15",
      "humidity": "60",
      "precip": "0.0",
      "pressure": "1013",
      "vis": "10",
      "cloud": "10",
      "dew": "10"
    }
  },
  "timestamp": 1699419000000
}
```

**特点：**
- ✅ 完整的和风天气 API 数据
- ✅ 包含更多气象参数
- ✅ 支持多种查询方式（经纬度、城市ID等）

## 小程序调用示例

### 方式1：使用 v1 简化接口（推荐）

```javascript
// weather.js
export async function getCurrentWeather(latitude, longitude) {
  const token = uni.getStorageSync('token')
  
  const res = await uni.request({
    url: 'https://api.yimengpl.com/api/v1/weather/current',
    method: 'GET',
    data: {
      latitude,
      longitude
    },
    header: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (res.data.code === 0) {
    return res.data.data
  } else {
    throw new Error(res.data.message)
  }
}

// 使用示例
const weatherData = await getCurrentWeather(39.9042, 116.4074)
console.log(`天气: ${weatherData.weather}`) // 晴，15-25℃
console.log(`温度: ${weatherData.temperature}℃`) // 20℃
```

### 方式2：使用旧版完整接口

```javascript
// weather.js
export async function getWeatherNow(longitude, latitude) {
  const token = uni.getStorageSync('token')
  const location = `${longitude},${latitude}`
  
  const res = await uni.request({
    url: 'https://api.yimengpl.com/api/weather/now',
    method: 'GET',
    data: {
      location
    },
    header: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (res.data.code === 0) {
    return res.data.data.now
  } else {
    throw new Error(res.data.message)
  }
}

// 使用示例
const weather = await getWeatherNow(116.4074, 39.9042)
console.log(`天气: ${weather.text}`) // 晴
console.log(`温度: ${weather.temp}℃`) // 20℃
console.log(`体感温度: ${weather.feelsLike}℃`) // 19℃
```

## 测试验证

### 本地测试

```bash
# 1. 启动后端服务
npm start

# 2. 运行测试脚本
node test-v1-weather.js
```

### 手动测试

使用 Postman 或 Apifox：

1. **登录获取 token**：
```http
POST http://localhost/api/auth/login
Content-Type: application/json

{
  "code": "test_code_123"
}
```

2. **调用天气 API**：
```http
GET http://localhost/api/v1/weather/current?latitude=39.9042&longitude=116.4074
Authorization: Bearer {上一步获取的token}
```

### 云端测试

```bash
# 修改 test-v1-weather.js 中的 baseURL
const baseURL = 'https://api.yimengpl.com'

# 运行测试
node test-v1-weather.js
```

## 环境配置

### 和风天气 API 配置（可选）

如果要使用真实天气数据，需要配置和风天气 API：

**`.env` 文件：**
```env
# 和风天气 API Key（免费版）
QWEATHER_API_KEY=your_qweather_api_key_here
```

**获取 API Key：**
1. 访问 [和风天气控制台](https://console.qweather.com)
2. 注册/登录账号
3. 创建应用，选择"免费订阅"
4. 复制 API Key 到 `.env` 文件

**不配置的情况：**
- API 会自动使用模拟数据
- 模拟数据基于经纬度生成，具有一定合理性
- 返回的数据中会包含 `isMock: true` 标识

## 注意事项

### 1. 认证要求

所有天气 API 接口都需要登录认证：
- ✅ 必须在请求头中携带有效的 JWT token
- ❌ 未登录或 token 无效会返回 401 错误

### 2. 参数格式

**v1 接口**：
- 参数：`latitude`、`longitude` （分开传递）
- 格式：数字类型
- 示例：`latitude=39.9042&longitude=116.4074`

**旧版接口**：
- 参数：`location` （合并传递）
- 格式：`经度,纬度`
- 示例：`location=116.4074,39.9042`

⚠️ **注意顺序不同**：v1 是纬度在前，旧版是经度在前

### 3. 缓存机制

- 天气数据会缓存 **5 分钟**
- 相同位置（精确到 2 位小数）共享缓存
- 可以通过 `/api/v1/weather/stats` 查看缓存统计

### 4. 错误处理

常见错误码：
- `400`：参数错误（经纬度缺失或格式不正确）
- `401`：未登录或 token 无效
- `404`：接口路径不存在
- `500`：服务器内部错误

## 相关文件

- `app.js` - 路由注册配置
- `routes/v1/weather.js` - v1 天气接口实现
- `routes/weather.js` - 完整天气接口实现
- `routes/weather-simple.js` - 简化天气接口
- `utils/qweather.js` - 和风天气 API 封装
- `test-v1-weather.js` - 测试脚本
- `docs/天气API使用指南.md` - 完整使用指南
- `miniapp-example/weather-with-location.js` - 小程序示例

## 更新日志

### 2024-11-08
- ✅ 修复 v1 天气 API 路由未注册的问题
- ✅ 在 `app.js` 中添加 `/api/v1/weather` 路由
- ✅ 创建测试脚本 `test-v1-weather.js`
- ✅ 完善文档说明

## 总结

通过在 `app.js` 中注册 v1 路由模块，解决了 404 错误。现在前端可以正常调用：

```
✅ GET /api/v1/weather/current
✅ GET /api/weather/now
✅ GET /api/weather/daily
✅ GET /api/weather/hourly
... 等其他天气接口
```

所有接口都需要登录认证，请确保在请求头中携带有效的 token。

---

**修复人员**：AI Assistant  
**修复时间**：2024-11-08  
**影响范围**：天气功能  
**测试状态**：待测试


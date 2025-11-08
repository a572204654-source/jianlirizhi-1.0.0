# 和风天气 API 接口文档

## 概述

本项目集成了和风天气 API，使用 JWT 认证方式（更安全），提供实时天气、天气预报、空气质量等气象数据服务。

## 认证方式

- **认证类型**: JWT (JSON Web Token) with Ed25519
- **算法**: EdDSA (Ed25519)
- **Token 有效期**: 1小时（自动续期）

## 配置说明

### 1. 环境变量配置

在 `.env` 文件中配置：

```env
QWEATHER_KEY_ID=CCB5WVJ6F8          # 凭据ID（从和风天气控制台获取）
QWEATHER_PROJECT_ID=2HKR2QW8Q7       # 项目ID（从和风天气控制台获取）
```

### 2. 密钥文件

- **私钥文件**: `ed25519-private.pem`（项目根目录，不要提交到Git）
- **公钥文件**: `ed25519-public.pem`（已上传到和风天气控制台）

## API 接口列表

所有接口的基础路径为：`/api/weather`

### 1. 获取实时天气

获取指定位置的实时天气数据。

**接口地址**: `GET /api/weather/now`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| location | string | 是 | 位置参数 | `116.41,39.92` 或 `101010100` |

位置参数支持：
- 经纬度：`116.41,39.92`（经度,纬度）
- 城市ID：`101010100`（北京）

**返回数据**:

```json
{
  "code": 0,
  "message": "获取实时天气成功",
  "data": {
    "success": true,
    "data": {
      "obsTime": "2024-11-08T12:00+08:00",
      "temp": "15",
      "feelsLike": "14",
      "icon": "100",
      "text": "晴",
      "wind360": "0",
      "windDir": "北风",
      "windScale": "1",
      "windSpeed": "3",
      "humidity": "45",
      "precip": "0.0",
      "pressure": "1020",
      "vis": "10",
      "cloud": "10",
      "dew": "2"
    },
    "updateTime": "2024-11-08T12:00+08:00",
    "fxLink": "https://www.qweather.com/..."
  },
  "timestamp": 1699430400000
}
```

**小程序调用示例**:

```javascript
// 获取北京实时天气
wx.request({
  url: 'https://api.yimengpl.com/api/weather/now',
  data: {
    location: '116.41,39.92'  // 北京经纬度
  },
  success(res) {
    if (res.data.code === 0) {
      const weather = res.data.data.data
      console.log('当前温度:', weather.temp + '°C')
      console.log('天气状况:', weather.text)
      console.log('相对湿度:', weather.humidity + '%')
    }
  }
})
```

### 2. 获取逐天天气预报

获取未来N天的天气预报。

**接口地址**: `GET /api/weather/daily`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| location | string | 是 | 位置参数 | `116.41,39.92` |
| days | number | 否 | 预报天数 | `7`（默认），可选 3/7/10/15/30 |

**返回数据**:

```json
{
  "code": 0,
  "message": "获取天气预报成功",
  "data": {
    "success": true,
    "data": [
      {
        "fxDate": "2024-11-08",
        "sunrise": "06:48",
        "sunset": "17:12",
        "moonrise": "15:30",
        "moonset": "03:20",
        "tempMax": "18",
        "tempMin": "8",
        "iconDay": "100",
        "textDay": "晴",
        "iconNight": "150",
        "textNight": "晴",
        "windDirDay": "北风",
        "windScaleDay": "1-2",
        "windSpeedDay": "10",
        "humidity": "40",
        "precip": "0.0",
        "pressure": "1020",
        "vis": "25",
        "cloud": "10",
        "uvIndex": "5"
      }
    ]
  }
}
```

**小程序调用示例**:

```javascript
// 获取未来7天天气预报
wx.request({
  url: 'https://api.yimengpl.com/api/weather/daily',
  data: {
    location: '116.41,39.92',
    days: 7
  },
  success(res) {
    if (res.data.code === 0) {
      const forecast = res.data.data.data
      forecast.forEach(day => {
        console.log(day.fxDate, day.textDay, `${day.tempMin}°C ~ ${day.tempMax}°C`)
      })
    }
  }
})
```

### 3. 获取逐小时天气预报

获取未来N小时的逐小时天气预报。

**接口地址**: `GET /api/weather/hourly`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| location | string | 是 | 位置参数 | `116.41,39.92` |
| hours | number | 否 | 预报小时数 | `24`（默认），可选 24/72/168 |

**小程序调用示例**:

```javascript
// 获取未来24小时天气
wx.request({
  url: 'https://api.yimengpl.com/api/weather/hourly',
  data: {
    location: '116.41,39.92',
    hours: 24
  },
  success(res) {
    if (res.data.code === 0) {
      const hourly = res.data.data.data
      hourly.forEach(hour => {
        console.log(hour.fxTime, hour.text, hour.temp + '°C')
      })
    }
  }
})
```

### 4. 获取天气生活指数

获取天气生活指数，如运动指数、穿衣指数等。

**接口地址**: `GET /api/weather/indices`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| location | string | 是 | 位置参数 | `116.41,39.92` |
| type | string | 否 | 指数类型 | `0`（默认=全部） |

**指数类型说明**:

| type | 说明 | type | 说明 |
|------|------|------|------|
| 0 | 全部指数 | 9 | 感冒指数 |
| 1 | 运动指数 | 10 | 空气污染扩散条件指数 |
| 2 | 洗车指数 | 11 | 空调开启指数 |
| 3 | 穿衣指数 | 12 | 太阳镜指数 |
| 4 | 钓鱼指数 | 13 | 化妆指数 |
| 5 | 紫外线指数 | 14 | 晾晒指数 |
| 6 | 旅游指数 | 15 | 交通指数 |
| 7 | 花粉过敏指数 | 16 | 防晒指数 |
| 8 | 舒适度指数 | | |

**小程序调用示例**:

```javascript
// 获取穿衣指数
wx.request({
  url: 'https://api.yimengpl.com/api/weather/indices',
  data: {
    location: '116.41,39.92',
    type: '3'  // 穿衣指数
  },
  success(res) {
    if (res.data.code === 0) {
      const indices = res.data.data.data
      indices.forEach(index => {
        console.log(index.name, index.category, index.text)
      })
    }
  }
})
```

### 5. 获取空气质量

获取指定位置的实时空气质量数据。

**接口地址**: `GET /api/weather/air`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| location | string | 是 | 位置参数 | `116.41,39.92` |

**返回数据字段**:

- `aqi`: 空气质量指数
- `category`: 空气质量类别（优/良/轻度污染等）
- `primary`: 主要污染物
- `pm10`: PM10浓度
- `pm2p5`: PM2.5浓度
- `no2`: 二氧化氮浓度
- `so2`: 二氧化硫浓度
- `co`: 一氧化碳浓度
- `o3`: 臭氧浓度

**小程序调用示例**:

```javascript
// 获取空气质量
wx.request({
  url: 'https://api.yimengpl.com/api/weather/air',
  data: {
    location: '116.41,39.92'
  },
  success(res) {
    if (res.data.code === 0) {
      const air = res.data.data.data
      console.log('AQI:', air.aqi)
      console.log('空气质量:', air.category)
      console.log('PM2.5:', air.pm2p5)
    }
  }
})
```

### 6. 城市搜索

搜索城市，获取城市ID和坐标信息。

**接口地址**: `GET /api/weather/city/search`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| location | string | 是 | 城市名称或关键词 | `北京` 或 `beijing` |

**小程序调用示例**:

```javascript
// 搜索城市
wx.request({
  url: 'https://api.yimengpl.com/api/weather/city/search',
  data: {
    location: '北京'
  },
  success(res) {
    if (res.data.code === 0) {
      const cities = res.data.data.data
      cities.forEach(city => {
        console.log('城市:', city.name)
        console.log('城市ID:', city.id)
        console.log('经纬度:', city.lon, city.lat)
      })
    }
  }
})
```

### 7. 获取天气预警

获取指定城市的天气预警信息。

**接口地址**: `GET /api/weather/warning`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| location | string | 是 | 城市ID | `101010100` |

**小程序调用示例**:

```javascript
// 获取天气预警
wx.request({
  url: 'https://api.yimengpl.com/api/weather/warning',
  data: {
    location: '101010100'  // 北京城市ID
  },
  success(res) {
    if (res.data.code === 0) {
      const warnings = res.data.data.data
      if (warnings.length > 0) {
        warnings.forEach(warning => {
          console.log('预警:', warning.title)
          console.log('级别:', warning.level)
          console.log('详情:', warning.text)
        })
      } else {
        console.log('暂无预警信息')
      }
    }
  }
})
```

### 8. 获取综合天气信息

一次性获取实时天气、天气预报、空气质量、天气预警等综合信息。

**接口地址**: `GET /api/weather/comprehensive`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| location | string | 是 | 位置参数 | `116.41,39.92` |

**返回数据**:

包含以下字段：
- `now`: 实时天气数据
- `daily`: 7天天气预报
- `hourly`: 24小时预报
- `air`: 空气质量
- `warning`: 天气预警

**小程序调用示例**:

```javascript
// 获取综合天气信息
wx.request({
  url: 'https://api.yimengpl.com/api/weather/comprehensive',
  data: {
    location: '116.41,39.92'
  },
  success(res) {
    if (res.data.code === 0) {
      const weather = res.data.data.data
      
      // 实时天气
      if (weather.now) {
        console.log('当前温度:', weather.now.temp + '°C')
        console.log('天气:', weather.now.text)
      }
      
      // 7天预报
      if (weather.daily) {
        console.log('未来7天预报:', weather.daily.length + '条')
      }
      
      // 空气质量
      if (weather.air) {
        console.log('AQI:', weather.air.aqi)
      }
      
      // 预警信息
      if (weather.warning && weather.warning.length > 0) {
        console.log('预警:', weather.warning.length + '条')
      }
    }
  }
})
```

## 位置参数说明

接口的 `location` 参数支持多种格式：

### 1. 经纬度坐标

格式：`经度,纬度`（注意：经度在前）

示例：
- 北京：`116.41,39.92`
- 上海：`121.47,31.23`
- 深圳：`114.06,22.55`

### 2. 城市ID

和风天气的城市ID，可通过城市搜索接口获取。

示例：
- 北京：`101010100`
- 上海：`101020100`
- 深圳：`101280601`

### 3. 获取经纬度的方法

在小程序中可以使用以下方法获取用户位置：

```javascript
// 获取用户位置
wx.getLocation({
  type: 'gcj02',  // 国测局坐标
  success(res) {
    const location = `${res.longitude},${res.latitude}`
    console.log('当前位置:', location)
    
    // 使用位置信息调用天气接口
    getWeather(location)
  }
})

// 获取天气
function getWeather(location) {
  wx.request({
    url: 'https://api.yimengpl.com/api/weather/now',
    data: { location },
    success(res) {
      console.log('天气数据:', res.data)
    }
  })
}
```

## 错误码说明

| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误（缺少必需参数或参数格式错误） |
| 500 | 服务器错误 |

和风天气API返回码说明：

| code | 说明 |
|------|------|
| 200 | 请求成功 |
| 204 | 请求成功但无数据 |
| 400 | 请求错误 |
| 401 | 认证失败 |
| 402 | 超过访问次数或余额不足 |
| 403 | 无访问权限 |
| 404 | 查询的数据或地区不存在 |
| 429 | 超过限定的QPM |
| 500 | 无响应或超时 |

## 使用限制

### 免费订阅限制

- **QPM限制**: 根据您的订阅计划
- **每日调用次数**: 根据您的订阅计划
- **数据更新频率**: 实时数据约10-20分钟更新一次

### 建议

1. **缓存数据**: 建议在小程序端缓存天气数据，避免频繁请求
2. **合理使用**: 根据实际需要选择合适的接口，避免调用不必要的接口
3. **错误处理**: 做好错误处理，当接口调用失败时显示默认数据或提示

## 技术架构

### JWT 认证流程

1. 服务端使用 Ed25519 私钥生成 JWT token
2. 每个 token 有效期 1 小时
3. token 自动缓存，过期前 5 分钟自动刷新
4. 请求和风天气 API 时，在请求头中携带 `Authorization: Bearer {token}`

### 文件说明

- `utils/qweather-jwt.js`: JWT token 生成工具
- `utils/qweather.js`: 和风天气 API 封装
- `routes/weather.js`: 天气接口路由
- `ed25519-private.pem`: Ed25519 私钥（不要泄露）
- `ed25519-public.pem`: Ed25519 公钥（已上传到和风天气控制台）

## 小程序完整示例

```javascript
// pages/weather/weather.js
Page({
  data: {
    weather: null,
    location: ''
  },

  onLoad() {
    this.getWeatherData()
  },

  // 获取天气数据
  getWeatherData() {
    // 先获取用户位置
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = `${res.longitude},${res.latitude}`
        this.setData({ location })
        
        // 获取综合天气信息
        this.fetchWeather(location)
      },
      fail: () => {
        // 定位失败，使用默认城市（北京）
        const location = '116.41,39.92'
        this.fetchWeather(location)
      }
    })
  },

  // 调用天气接口
  fetchWeather(location) {
    wx.showLoading({ title: '加载中...' })
    
    wx.request({
      url: 'https://api.yimengpl.com/api/weather/comprehensive',
      data: { location },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            weather: res.data.data.data
          })
        } else {
          wx.showToast({
            title: '获取天气失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
})
```

## 常见问题

### 1. JWT 认证失败

**错误信息**: "和风天气API错误: 401"

**解决方法**:
- 检查环境变量 `QWEATHER_KEY_ID` 和 `QWEATHER_PROJECT_ID` 是否配置正确
- 确认私钥文件 `ed25519-private.pem` 存在于项目根目录
- 验证公钥是否正确上传到和风天气控制台

### 2. 位置参数无效

**错误信息**: "和风天气API错误: 400"

**解决方法**:
- 检查经纬度格式是否正确（经度在前，纬度在后）
- 确认城市ID是否正确
- 经纬度范围：经度 -180 到 180，纬度 -90 到 90

### 3. 超过调用限制

**错误信息**: "和风天气API错误: 429"

**解决方法**:
- 实现数据缓存，减少请求次数
- 升级和风天气订阅计划
- 检查是否有异常请求

## 更新日志

### v1.0.0 (2024-11-08)

- ✅ 集成和风天气 API
- ✅ 使用 JWT 认证方式（Ed25519）
- ✅ 实现实时天气、天气预报、空气质量等接口
- ✅ 支持城市搜索和天气预警
- ✅ 提供综合天气信息接口

---

**文档维护**: 艺萌科技
**最后更新**: 2024-11-08
**和风天气官方文档**: https://dev.qweather.com/docs/api/


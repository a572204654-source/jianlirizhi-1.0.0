# 简化天气API使用说明

## 📌 需求分析

根据您提供的图片，只需要以下4个核心数据：

```
天气：阴    气温：12~26℃  风向：偏西  风力：2~3级
```

## 🎯 简化后的接口设计

### 1. 简化天气数据接口

**接口地址**: `GET /api/weather/simple`

**请求参数**:
- `location`: 位置（经纬度 "116.41,39.92" 或城市ID）

**返回数据格式**:

```json
{
  "code": 0,
  "message": "获取天气成功",
  "data": {
    "weather": "阴",           // 天气状况
    "tempRange": "12~26℃",     // 温度范围
    "tempMin": "12",           // 最低温度
    "tempMax": "26",           // 最高温度
    "tempNow": "15",           // 当前温度
    "windDir": "偏西",         // 风向
    "windScale": "2-3",        // 风力等级
    "updateTime": "2025-11-08T17:00+08:00"  // 更新时间
  },
  "timestamp": 1699430400000
}
```

### 2. 格式化显示接口

**接口地址**: `GET /api/weather/display`

**请求参数**:
- `location`: 位置（经纬度 "116.41,39.92" 或城市ID）

**返回数据格式**:

```json
{
  "code": 0,
  "message": "获取天气成功",
  "data": {
    "data": {
      "weather": "阴",
      "tempRange": "12~26℃",
      "windDir": "偏西",
      "windScale": "2-3"
    },
    "displayText": "天气：阴    气温：12~26℃  风向：偏西  风力：2-3级"
  },
  "timestamp": 1699430400000
}
```

## 📱 小程序调用示例

### 方式1：获取结构化数据

```javascript
wx.getLocation({
  type: 'gcj02',
  success: (res) => {
    const location = `${res.longitude},${res.latitude}`
    
    wx.request({
      url: 'https://api.yimengpl.com/api/weather/simple',
      data: { location },
      success: (res) => {
        if (res.data.code === 0) {
          const weather = res.data.data
          
          // 在页面上显示
          this.setData({
            weather: weather.weather,
            temp: weather.tempRange,
            windDir: weather.windDir,
            windScale: weather.windScale
          })
          
          console.log('天气:', weather.weather)
          console.log('气温:', weather.tempRange)
          console.log('风向:', weather.windDir)
          console.log('风力:', weather.windScale + '级')
        }
      }
    })
  }
})
```

### 方式2：获取格式化文本（推荐）

```javascript
wx.getLocation({
  type: 'gcj02',
  success: (res) => {
    const location = `${res.longitude},${res.latitude}`
    
    wx.request({
      url: 'https://api.yimengpl.com/api/weather/display',
      data: { location },
      success: (res) => {
        if (res.data.code === 0) {
          const displayText = res.data.data.displayText
          
          // 直接显示格式化好的文本
          this.setData({
            weatherText: displayText
          })
          
          // 输出：天气：阴    气温：12~26℃  风向：偏西  风力：2-3级
          console.log(displayText)
        }
      }
    })
  }
})
```

### 方式3：使用固定位置测试

```javascript
// 使用北京的经纬度测试
wx.request({
  url: 'https://api.yimengpl.com/api/weather/display',
  data: {
    location: '116.41,39.92'  // 北京
  },
  success: (res) => {
    console.log(res.data.data.displayText)
  }
})
```

## 🔧 接口实现说明

### 数据来源

接口会并行调用和风天气API获取两个数据：
1. **实时天气** (`/v7/weather/now`) - 获取当前天气状况、当前温度、风向
2. **今日预报** (`/v7/weather/3d`) - 获取今日最低/最高温度、风力等级

然后组合成简化的数据结构返回。

### 实现逻辑

```javascript
// utils/qweather-simple.js

1. 并行请求实时天气和今日预报
2. 提取核心字段：
   - weather: 从实时天气获取 text 字段
   - tempRange: 组合今日预报的 tempMin 和 tempMax
   - windDir: 从实时天气获取 windDir 字段  
   - windScale: 从今日预报获取 windScaleDay 字段
3. 组装返回数据
```

## 🎨 小程序UI展示

### WXML示例

```xml
<view class="weather-container">
  <text class="weather-text">{{weatherText}}</text>
</view>

<!-- 或者分开显示 -->
<view class="weather-detail">
  <text>天气：{{weather}}</text>
  <text>气温：{{tempRange}}</text>
  <text>风向：{{windDir}}</text>
  <text>风力：{{windScale}}级</text>
</view>
```

### WXSS样式

```css
.weather-container {
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.weather-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.weather-detail {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
}

.weather-detail text {
  margin-right: 15px;
  font-size: 14px;
  color: #666;
}
```

## ⚠️ 当前问题

### 和风天气API限制

您的和风天气免费订阅目前返回**403 Forbidden**，可能的原因：

1. **配额用完** - 免费订阅有每日请求次数限制
2. **订阅过期** - 免费试用期结束
3. **权限不足** - JWT认证方式可能需要付费订阅

### 解决方案

#### 方案1：升级和风天气订阅（推荐）

登录和风天气控制台升级到付费订阅计划，支持JWT认证和更高的请求配额。

#### 方案2：切换到API Key认证

免费版可能只支持API Key认证方式，需要修改代码：

```javascript
// 使用API Key而不是JWT
const response = await axios.get('https://devapi.qweather.com/v7/weather/now', {
  params: {
    location: location,
    key: process.env.QWEATHER_API_KEY  // 使用API Key
  }
})
```

#### 方案3：使用其他天气API

考虑使用其他免费的天气API服务：
- 中国天气网API
- OpenWeatherMap（支持中国）
- 心知天气

#### 方案4：使用模拟数据（临时方案）

在调试期间，可以返回模拟数据确保接口正常工作。

## 📋 下一步操作建议

1. **检查和风天气控制台**
   - 登录 https://console.qweather.com
   - 查看订阅状态和剩余配额
   - 查看是否有错误日志

2. **确认认证方式**
   - JWT认证可能只对付费用户开放
   - 考虑切换到API Key认证

3. **升级订阅计划**
   - 如果确实需要使用和风天气
   - 付费订阅支持JWT和更高配额

4. **或者切换API提供商**
   - 寻找其他免费/低成本的天气API
   - 重新适配接口代码

---

**创建时间**: 2025-11-08  
**状态**: 代码已完成，等待和风天气API权限确认


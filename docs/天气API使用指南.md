# 📍 天气 API 使用指南 - 支持定位查询

## 🎯 功能概述

本项目已集成和风天气 API，支持通过**用户定位**（经纬度）或**城市 ID** 查询天气信息。

---

## 🚀 快速开始

### 1. 后端接口已准备好

所有天气接口已在 `/api/weather/` 路径下就绪：

- ✅ 实时天气：`GET /api/weather/now`
- ✅ 天气预报：`GET /api/weather/daily`
- ✅ 逐小时预报：`GET /api/weather/hourly`
- ✅ 空气质量：`GET /api/weather/air`
- ✅ 生活指数：`GET /api/weather/indices`
- ✅ 天气预警：`GET /api/weather/warning`
- ✅ 综合信息：`GET /api/weather/comprehensive`（推荐）

### 2. 支持两种定位方式

#### 方式一：通过经纬度（推荐）
```
location=经度,纬度
示例: location=116.41,39.92
```

#### 方式二：通过城市 ID
```
location=城市ID
示例: location=101010100 (北京)
```

---

## 📱 小程序端使用

### 完整流程

```javascript
// 1. 获取用户定位授权
wx.getSetting({
  success: (res) => {
    if (!res.authSetting['scope.userLocation']) {
      // 请求定位授权
      wx.authorize({
        scope: 'scope.userLocation',
        success: () => {
          // 授权成功，获取定位
          getLocationAndWeather()
        }
      })
    } else {
      // 已授权，直接获取
      getLocationAndWeather()
    }
  }
})

// 2. 获取定位并查询天气
function getLocationAndWeather() {
  wx.getLocation({
    type: 'wgs84',
    success: (res) => {
      const { longitude, latitude } = res
      
      // 3. 调用后端接口
      wx.request({
        url: 'https://your-domain.com/api/weather/now',
        data: {
          location: `${longitude},${latitude}`
        },
        success: (res) => {
          if (res.data.code === 0) {
            const weather = res.data.data.data
            console.log('天气:', weather)
            // 显示天气信息
            // 温度: weather.temp
            // 天气: weather.text
            // 湿度: weather.humidity
          }
        }
      })
    }
  })
}
```

### 配置小程序权限

在 `app.json` 中添加：

```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "您的位置信息将用于获取当地天气"
    }
  },
  "requiredPrivateInfos": [
    "getLocation"
  ]
}
```

---

## 🌐 API 接口详解

### 1. 获取实时天气（推荐）

**接口**: `GET /api/weather/now`

**请求参数**:
```
location: 经纬度（116.41,39.92）或城市ID（101010100）
```

**请求示例**:
```javascript
wx.request({
  url: 'https://your-domain.com/api/weather/now',
  data: {
    location: '116.41,39.92' // 或 '101010100'
  },
  success: (res) => {
    console.log(res.data)
  }
})
```

**返回数据**:
```json
{
  "code": 0,
  "message": "获取实时天气成功",
  "data": {
    "success": true,
    "data": {
      "temp": "8",              // 温度（℃）
      "text": "雾",             // 天气状况
      "icon": "501",            // 天气图标代码
      "feelsLike": "7",         // 体感温度
      "humidity": "91",         // 相对湿度（%）
      "windDir": "东北风",      // 风向
      "windScale": "1",         // 风力等级
      "windSpeed": "3",         // 风速（km/h）
      "pressure": "1028",       // 大气压强
      "vis": "5",               // 能见度（km）
      "cloud": "100",           // 云量（%）
      "dew": "6"                // 露点温度
    },
    "updateTime": "2025-11-08T20:50+08:00"
  },
  "timestamp": 1699200000000
}
```

---

### 2. 获取综合天气信息（一次获取全部）

**接口**: `GET /api/weather/comprehensive`

**请求参数**:
```
location: 经纬度或城市ID
```

**返回数据包含**:
- 实时天气 (`now`)
- 7天天气预报 (`daily`)
- 24小时预报 (`hourly`)
- 空气质量 (`air`)
- 天气预警 (`warning`)

**请求示例**:
```javascript
wx.request({
  url: 'https://your-domain.com/api/weather/comprehensive',
  data: {
    location: '116.41,39.92'
  },
  success: (res) => {
    const data = res.data.data
    console.log('实时天气:', data.now)
    console.log('7天预报:', data.daily)
    console.log('空气质量:', data.air)
  }
})
```

---

### 3. 获取天气预报

**接口**: `GET /api/weather/daily`

**请求参数**:
```
location: 经纬度或城市ID
days: 预报天数（3/7/10/15/30，默认7）
```

**返回数据示例**:
```json
{
  "code": 0,
  "data": {
    "daily": [
      {
        "fxDate": "2025-11-08",
        "tempMax": "13",        // 最高温度
        "tempMin": "7",         // 最低温度
        "textDay": "多云",      // 白天天气
        "textNight": "晴",      // 夜间天气
        "iconDay": "101",
        "iconNight": "150",
        "windDirDay": "东北风",
        "windScaleDay": "1-2"
      }
      // ... 更多天
    ]
  }
}
```

---

### 4. 获取逐小时预报

**接口**: `GET /api/weather/hourly`

**请求参数**:
```
location: 经纬度或城市ID
hours: 预报小时数（24/72/168，默认24）
```

---

### 5. 获取空气质量

**接口**: `GET /api/weather/air`

**请求参数**:
```
location: 经纬度或城市ID
```

**返回数据包含**:
- AQI（空气质量指数）
- PM2.5、PM10 浓度
- 空气质量等级
- 主要污染物

---

### 6. 获取生活指数

**接口**: `GET /api/weather/indices`

**请求参数**:
```
location: 经纬度或城市ID
type: 指数类型（可选）
  0=全部, 1=运动, 2=洗车, 3=穿衣, 4=钓鱼, 
  5=紫外线, 6=旅游, 7=花粉过敏, 8=舒适度, 
  9=感冒, 10=空气污染扩散, 11=空调开启, 
  12=太阳镜, 13=化妆, 14=晾晒, 15=交通, 16=防晒
```

---

## 🎨 小程序页面示例

### Page JS
```javascript
Page({
  data: {
    weather: null,
    loading: false
  },

  onLoad() {
    this.getWeather()
  },

  // 获取天气
  async getWeather() {
    this.setData({ loading: true })
    
    // 1. 获取定位
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        const { longitude, latitude } = res
        
        // 2. 请求天气接口
        wx.request({
          url: 'https://your-domain.com/api/weather/comprehensive',
          data: {
            location: `${longitude},${latitude}`
          },
          success: (res) => {
            if (res.data.code === 0) {
              this.setData({
                weather: res.data.data,
                loading: false
              })
            }
          },
          fail: () => {
            this.setData({ loading: false })
            wx.showToast({ title: '获取天气失败', icon: 'none' })
          }
        })
      },
      fail: () => {
        this.setData({ loading: false })
        wx.showToast({ title: '获取定位失败', icon: 'none' })
      }
    })
  }
})
```

### WXML
```xml
<view class="container">
  <!-- 加载中 -->
  <view wx:if="{{loading}}">加载中...</view>

  <!-- 天气信息 -->
  <view wx:else class="weather-box">
    <!-- 实时天气 -->
    <view class="current">
      <text class="temp">{{weather.now.data.temp}}°C</text>
      <text class="text">{{weather.now.data.text}}</text>
      <text class="feels">体感 {{weather.now.data.feelsLike}}°C</text>
    </view>

    <!-- 详细信息 -->
    <view class="details">
      <view class="item">
        <text>湿度</text>
        <text>{{weather.now.data.humidity}}%</text>
      </view>
      <view class="item">
        <text>风力</text>
        <text>{{weather.now.data.windScale}}级</text>
      </view>
      <view class="item">
        <text>风向</text>
        <text>{{weather.now.data.windDir}}</text>
      </view>
    </view>

    <!-- 7天预报 -->
    <view class="forecast">
      <view class="title">未来7天</view>
      <view wx:for="{{weather.daily.daily}}" wx:key="fxDate" class="day">
        <text>{{item.fxDate}}</text>
        <text>{{item.textDay}}</text>
        <text>{{item.tempMin}}-{{item.tempMax}}°C</text>
      </view>
    </view>

    <!-- 空气质量 -->
    <view wx:if="{{weather.air.success}}" class="air">
      <text>空气质量 AQI: {{weather.air.data.aqi}}</text>
      <text>{{weather.air.data.category}}</text>
    </view>
  </view>
</view>
```

---

## 📍 常用城市 ID 参考

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
  '重庆': '101040100',
  '天津': '101030100',
  '苏州': '101190401',
  '郑州': '101180101',
  '长沙': '101250101',
  '沈阳': '101070101',
  '青岛': '101120201',
  '宁波': '101210401',
  '无锡': '101190201'
}
```

完整城市列表: https://dev.qweather.com/docs/resource/location-list/

---

## ⚠️ 注意事项

### 1. 定位权限
- 小程序必须配置定位权限说明
- 用户首次使用需要授权
- 拒绝授权后需要引导用户到设置页面

### 2. 定位类型
```javascript
wx.getLocation({
  type: 'wgs84',    // 推荐，返回 GPS 坐标
  // type: 'gcj02'  // 国测局坐标（中国特有）
})
```

### 3. 经纬度格式
- 格式: `经度,纬度`（用逗号分隔）
- 示例: `116.41,39.92`
- 经度在前，纬度在后

### 4. 缓存建议
- 天气数据不需要频繁刷新
- 建议缓存 5-10 分钟
- 下拉刷新时重新获取

### 5. 错误处理
```javascript
// 定位失败处理
wx.getLocation({
  fail: (err) => {
    if (err.errMsg.indexOf('auth deny') !== -1) {
      // 用户拒绝授权
      wx.showModal({
        title: '需要定位权限',
        content: '请允许获取您的位置信息',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            wx.openSetting()
          }
        }
      })
    } else {
      // 其他错误
      wx.showToast({ title: '定位失败', icon: 'none' })
    }
  }
})
```

---

## 🔧 调试技巧

### 1. 查看环境变量配置
```
GET /api/weather/debug-config
```

### 2. 使用固定坐标测试
```javascript
// 不调用 wx.getLocation，直接使用固定坐标
const location = '116.41,39.92' // 北京天安门
```

### 3. 模拟器定位
- 微信开发者工具支持模拟定位
- 工具栏 -> 调试 -> 位置模拟

---

## 📦 完整示例代码

详细的小程序调用示例请查看:
- `miniapp-example/weather-with-location.js`

包含:
- ✅ 完整的定位授权流程
- ✅ 天气接口调用示例
- ✅ 页面展示代码
- ✅ 样式参考

---

## 🎉 总结

### 现在你可以：

1. ✅ **通过用户定位查询天气**
   ```javascript
   wx.getLocation() → 调用 /api/weather/now
   ```

2. ✅ **获取综合天气信息**
   ```javascript
   /api/weather/comprehensive → 实时+预报+空气质量
   ```

3. ✅ **在小程序中展示天气**
   - 实时温度、天气状况
   - 7天天气预报
   - 空气质量指数
   - 生活指数建议

---

## 🔗 相关文档

- [和风天气JWT配置完成.md](./和风天气JWT配置完成.md) - JWT 认证配置说明
- [API.md](../API.md) - 完整 API 文档
- [和风天气开发文档](https://dev.qweather.com/docs/)

---

**最后更新**: 2025-11-08  
**测试状态**: ✅ 已测试通过

🎊 现在可以在小程序中获取定位并查询天气了！


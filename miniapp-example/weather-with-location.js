/**
 * 小程序端：获取定位并查询天气示例
 * 
 * 使用说明:
 * 1. 在 app.json 中配置权限
 * 2. 在页面中调用 getLocationAndWeather()
 * 3. 显示天气信息
 */

// ==================================================
// 方式1: 获取定位并查询实时天气（推荐）
// ==================================================

/**
 * 获取用户定位并查询天气
 */
function getLocationAndWeather() {
  return new Promise((resolve, reject) => {
    // 1. 获取用户授权
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          // 已授权，直接获取定位
          getLocation(resolve, reject)
        } else {
          // 未授权，请求授权
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              // 授权成功，获取定位
              getLocation(resolve, reject)
            },
            fail: () => {
              // 授权失败，引导用户打开设置
              wx.showModal({
                title: '需要定位权限',
                content: '需要获取您的位置信息来查询当地天气',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting()
                  }
                }
              })
              reject(new Error('用户拒绝授权定位'))
            }
          })
        }
      }
    })
  })
}

/**
 * 获取定位信息
 */
function getLocation(resolve, reject) {
  wx.getLocation({
    type: 'wgs84', // 返回 GPS 坐标
    success: (res) => {
      const { latitude, longitude } = res
      console.log('定位成功:', latitude, longitude)
      
      // 2. 调用后端天气接口
      fetchWeather(longitude, latitude)
        .then(weatherData => {
          resolve({
            location: { latitude, longitude },
            weather: weatherData
          })
        })
        .catch(reject)
    },
    fail: (err) => {
      console.error('定位失败:', err)
      wx.showToast({
        title: '定位失败',
        icon: 'none'
      })
      reject(err)
    }
  })
}

/**
 * 调用后端天气接口
 */
function fetchWeather(longitude, latitude) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://your-domain.com/api/weather/now',
      method: 'GET',
      data: {
        location: `${longitude},${latitude}` // 格式: "经度,纬度"
      },
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.data)
        } else {
          reject(new Error(res.data.message))
        }
      },
      fail: reject
    })
  })
}

// ==================================================
// 方式2: 获取综合天气信息（实时+预报+空气质量）
// ==================================================

/**
 * 获取综合天气信息
 */
function getComprehensiveWeather(longitude, latitude) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://your-domain.com/api/weather/comprehensive',
      method: 'GET',
      data: {
        location: `${longitude},${latitude}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          const data = res.data.data
          resolve({
            now: data.now,           // 实时天气
            daily: data.daily,       // 7天预报
            hourly: data.hourly,     // 24小时预报
            air: data.air,           // 空气质量
            warning: data.warning    // 天气预警
          })
        } else {
          reject(new Error(res.data.message))
        }
      },
      fail: reject
    })
  })
}

// ==================================================
// 完整页面示例
// ==================================================

Page({
  data: {
    location: null,
    weather: null,
    loading: false
  },

  /**
   * 页面加载时获取天气
   */
  onLoad() {
    this.loadWeather()
  },

  /**
   * 加载天气数据
   */
  async loadWeather() {
    this.setData({ loading: true })
    
    try {
      const result = await getLocationAndWeather()
      
      this.setData({
        location: result.location,
        weather: result.weather.data,
        loading: false
      })
      
      console.log('天气数据:', result.weather.data)
    } catch (error) {
      console.error('获取天气失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '获取天气失败',
        icon: 'none'
      })
    }
  },

  /**
   * 刷新天气
   */
  refreshWeather() {
    this.loadWeather()
  }
})

// ==================================================
// WXML 页面展示示例
// ==================================================

/*
<!-- weather.wxml -->
<view class="container">
  <!-- 加载中 -->
  <view wx:if="{{loading}}" class="loading">
    <text>正在获取天气...</text>
  </view>

  <!-- 天气信息 -->
  <view wx:else class="weather-info">
    <!-- 位置信息 -->
    <view class="location">
      <text>📍 经度: {{location.longitude}}, 纬度: {{location.latitude}}</text>
    </view>

    <!-- 实时天气 -->
    <view class="current-weather">
      <view class="temp">{{weather.temp}}°C</view>
      <view class="text">{{weather.text}}</view>
      <view class="details">
        <text>体感温度: {{weather.feelsLike}}°C</text>
        <text>湿度: {{weather.humidity}}%</text>
        <text>风向: {{weather.windDir}}</text>
        <text>风力: {{weather.windScale}}级</text>
      </view>
    </view>

    <!-- 刷新按钮 -->
    <button bindtap="refreshWeather">刷新天气</button>
  </view>
</view>
*/

// ==================================================
// WXSS 样式示例
// ==================================================

/*
.container {
  padding: 20rpx;
}

.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.location {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.current-weather {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  color: white;
  text-align: center;
}

.temp {
  font-size: 100rpx;
  font-weight: bold;
}

.text {
  font-size: 32rpx;
  margin-top: 10rpx;
}

.details {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 30rpx;
  font-size: 24rpx;
  justify-content: center;
}
*/

// ==================================================
// app.json 配置（添加定位权限）
// ==================================================

/*
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
*/

// ==================================================
// 导出函数供其他页面使用
// ==================================================

module.exports = {
  getLocationAndWeather,
  getLocation,
  fetchWeather,
  getComprehensiveWeather
}


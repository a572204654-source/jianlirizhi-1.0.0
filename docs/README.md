# 监理日志小程序后端 - 文档目录

## 📚 文档索引

本目录包含项目的所有技术文档和集成说明。

### 核心文档

#### 1. [天气API文档](./天气API文档.md) 📖

**用途**: 接口使用参考手册  
**适合**: 前端开发、API调用

**包含内容**:
- 所有天气API接口的详细说明
- 请求参数和返回格式
- 小程序调用示例代码
- 错误码说明
- 位置参数使用指南

#### 2. [和风天气集成说明](./和风天气集成说明.md) 🔧

**用途**: 快速开始指南  
**适合**: 项目部署、故障排查

**包含内容**:
- 环境配置步骤
- 快速测试方法
- 接口功能对照表
- 技术实现细节
- 部署到云托管的步骤
- 常见问题解决方案

#### 3. [和风天气集成完成报告](./和风天气集成完成报告.md) ✅

**用途**: 集成工作总结  
**适合**: 项目管理、技术评审

**包含内容**:
- 完整的工作清单
- 功能状态表
- 测试结果报告
- 性能指标
- 维护建议
- 下一步工作计划

---

## 🎯 快速导航

### 我想了解...

#### "如何调用天气API？"
👉 查看 [天气API文档](./天气API文档.md)
- 第一章：接口概述
- 小程序调用示例

#### "如何部署到生产环境？"
👉 查看 [和风天气集成说明](./和风天气集成说明.md)
- 第5节：部署到云托管

#### "哪些功能可用？哪些不可用？"
👉 查看 [和风天气集成完成报告](./和风天气集成完成报告.md)
- 功能状态表
- 可用接口/受限接口

#### "遇到403/401错误怎么办？"
👉 查看 [和风天气集成说明](./和风天气集成说明.md)
- 故障排查章节

---

## 📋 项目结构

```
项目根目录/
├── docs/                           # 📚 文档目录（当前位置）
│   ├── README.md                  # 文档索引（本文件）
│   ├── 天气API文档.md              # API接口参考手册
│   ├── 和风天气集成说明.md         # 快速开始指南
│   └── 和风天气集成完成报告.md     # 集成工作总结
│
├── scripts/                        # 🔧 脚本工具
│   └── generate-ed25519-keys.js   # 密钥生成脚本
│
├── utils/                          # 🛠️ 工具模块
│   ├── qweather-jwt.js            # JWT认证工具
│   └── qweather.js                # 天气API封装
│
├── routes/                         # 🚏 路由模块
│   └── weather.js                 # 天气路由
│
├── test/                           # 🧪 测试脚本
│   ├── weather-api-test.js        # API测试脚本
│   └── jwt-debug.js               # JWT调试工具
│
├── ed25519-private.pem             # 🔐 私钥文件（不提交）
├── ed25519-public.pem              # 🔑 公钥文件
└── .env                            # ⚙️ 环境配置

```

---

## 🔑 核心配置

### 环境变量

```env
# 和风天气 JWT 认证配置
QWEATHER_KEY_ID=CCB5WVJ6F8        # 凭据ID
QWEATHER_PROJECT_ID=2HKR2QW8Q7     # 项目ID
```

### 密钥文件

- **私钥**: `ed25519-private.pem` （项目根目录，已加入.gitignore）
- **公钥**: 已上传到和风天气控制台

---

## ✅ 功能状态

### 可用功能 ✅

| 功能 | 接口路径 | 状态 |
|------|---------|------|
| 实时天气 | `/api/weather/now` | ✅ 可用 |
| 逐天预报 | `/api/weather/daily` | ✅ 可用 |
| 逐小时预报 | `/api/weather/hourly` | ✅ 可用 |

### 受限功能 ⚠️

| 功能 | 接口路径 | 状态 | 原因 |
|------|---------|------|------|
| 空气质量 | `/api/weather/air` | ⚠️ 403 | 需要更高订阅计划 |
| 天气预警 | `/api/weather/warning` | ⚠️ 403 | 需要更高订阅计划 |
| 生活指数 | `/api/weather/indices` | ❓ 未测试 | - |

---

## 🚀 快速开始

### 1. 测试本地接口

```bash
# 启动服务
npm start

# 测试实时天气（另一个终端）
curl "http://localhost/api/weather/now?location=116.41,39.92"

# 测试7天预报
curl "http://localhost/api/weather/daily?location=116.41,39.92&days=7"
```

### 2. 运行测试脚本

```bash
# 完整API测试
node test/weather-api-test.js

# JWT调试
node test/jwt-debug.js
```

### 3. 小程序调用

```javascript
wx.request({
  url: 'https://api.yimengpl.com/api/weather/now',
  data: {
    location: '116.41,39.92'  // 北京经纬度
  },
  success(res) {
    console.log('天气:', res.data)
  }
})
```

---

## 📖 使用示例

### 获取用户位置天气

```javascript
// 1. 获取用户位置
wx.getLocation({
  type: 'gcj02',
  success: (res) => {
    const location = `${res.longitude},${res.latitude}`
    
    // 2. 获取天气
    wx.request({
      url: 'https://api.yimengpl.com/api/weather/now',
      data: { location },
      success: (res) => {
        if (res.data.code === 0) {
          const weather = res.data.data.data
          console.log('当前温度:', weather.temp + '°C')
          console.log('天气状况:', weather.text)
          console.log('相对湿度:', weather.humidity + '%')
        }
      }
    })
  }
})
```

### 数据缓存策略

```javascript
// 缓存实时天气数据30分钟
const CACHE_KEY = 'weather_now'
const CACHE_TIME = 30 * 60 * 1000

function getWeatherWithCache(location) {
  const cache = wx.getStorageSync(CACHE_KEY)
  const now = Date.now()
  
  // 检查缓存是否有效
  if (cache && (now - cache.timestamp < CACHE_TIME)) {
    return Promise.resolve(cache.data)
  }
  
  // 请求新数据
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://api.yimengpl.com/api/weather/now',
      data: { location },
      success: (res) => {
        if (res.data.code === 0) {
          // 保存到缓存
          wx.setStorageSync(CACHE_KEY, {
            data: res.data,
            timestamp: now
          })
          resolve(res.data)
        } else {
          reject(res.data.message)
        }
      },
      fail: reject
    })
  })
}
```

---

## 🔍 故障排查

### 常见问题

#### 1. 403 Forbidden

**现象**: 接口返回403错误

**原因**:
- 当前订阅计划不支持该接口
- JWT认证失败

**解决**:
1. 检查订阅计划权限
2. 验证环境变量配置
3. 运行 `node test/jwt-debug.js` 检查JWT

#### 2. 401 Unauthorized

**现象**: 接口返回401错误

**原因**: JWT认证失败

**解决**:
1. 确认环境变量 `QWEATHER_KEY_ID` 和 `QWEATHER_PROJECT_ID` 正确
2. 检查私钥文件 `ed25519-private.pem` 是否存在
3. 验证公钥是否正确上传到控制台

#### 3. 私钥文件不存在

**现象**: 启动报错找不到私钥文件

**解决**:
```bash
# 重新生成密钥对
node scripts/generate-ed25519-keys.js

# 查看公钥
cat ed25519-public.pem

# 上传公钥到和风天气控制台
```

---

## 📊 性能建议

### 缓存策略

| 数据类型 | 建议缓存时间 | 说明 |
|---------|-------------|------|
| 实时天气 | 20-30分钟 | 天气更新频率约20分钟 |
| 天气预报 | 1-2小时 | 预报数据更新较慢 |
| 用户位置 | 应用生命周期 | 减少定位请求 |

### 请求优化

1. **按需请求**: 根据页面需要选择合适的接口
2. **批量获取**: 考虑使用综合接口减少请求次数
3. **错误降级**: 接口失败时显示缓存数据

---

## 🔗 相关链接

- [和风天气控制台](https://console.qweather.com)
- [和风天气API文档](https://dev.qweather.com/docs/api/)
- [JWT认证说明](https://dev.qweather.com/docs/resource/signature-auth/)
- [项目GitHub](#) （如有）

---

## 📞 技术支持

### 项目相关

如遇到问题，请按以下顺序排查：

1. 查看本文档目录中的相关文档
2. 运行测试脚本检查功能状态
3. 查看服务端日志
4. 查看和风天气控制台状态

### 和风天气支持

- 控制台: https://console.qweather.com
- 文档中心: https://dev.qweather.com/docs/
- 技术支持: 通过控制台提交工单

---

## 📝 更新日志

### 2025-11-08

- ✅ 完成和风天气API集成
- ✅ 实现JWT认证系统（Ed25519）
- ✅ 创建天气API接口（8个）
- ✅ 编写完整文档
- ✅ 测试核心功能

**下一步**:
- 部署到云托管环境
- 小程序端集成开发
- （可选）升级订阅计划启用更多功能

---

**最后更新**: 2025-11-08  
**维护者**: 艺萌科技  
**版本**: v1.0.0


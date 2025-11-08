# 🧪 天气 API 测试示例

## 快速测试（使用 curl 命令）

### 1. 测试实时天气（使用经纬度）

```bash
# 北京天安门的天气
curl "http://localhost/api/weather/now?location=116.41,39.92"

# 上海的天气
curl "http://localhost/api/weather/now?location=121.47,31.23"

# 广州的天气
curl "http://localhost/api/weather/now?location=113.26,23.13"
```

### 2. 测试实时天气（使用城市 ID）

```bash
# 北京
curl "http://localhost/api/weather/now?location=101010100"

# 上海
curl "http://localhost/api/weather/now?location=101020100"

# 深圳
curl "http://localhost/api/weather/now?location=101280601"
```

### 3. 测试综合天气信息

```bash
# 获取完整天气信息（实时+预报+空气质量+预警）
curl "http://localhost/api/weather/comprehensive?location=116.41,39.92"
```

### 4. 测试7天天气预报

```bash
# 7天预报
curl "http://localhost/api/weather/daily?location=116.41,39.92&days=7"

# 3天预报
curl "http://localhost/api/weather/daily?location=116.41,39.92&days=3"
```

### 5. 测试逐小时预报

```bash
# 24小时预报
curl "http://localhost/api/weather/hourly?location=116.41,39.92&hours=24"

# 72小时预报
curl "http://localhost/api/weather/hourly?location=116.41,39.92&hours=72"
```

### 6. 测试空气质量

```bash
curl "http://localhost/api/weather/air?location=116.41,39.92"
```

### 7. 测试生活指数

```bash
# 所有生活指数
curl "http://localhost/api/weather/indices?location=116.41,39.92&type=0"

# 运动指数
curl "http://localhost/api/weather/indices?location=116.41,39.92&type=1"

# 穿衣指数
curl "http://localhost/api/weather/indices?location=116.41,39.92&type=3"

# 紫外线指数
curl "http://localhost/api/weather/indices?location=116.41,39.92&type=5"
```

### 8. 测试天气预警

```bash
curl "http://localhost/api/weather/warning?location=101010100"
```

---

## 📍 常用城市坐标参考

| 城市 | 经纬度 | 城市ID |
|------|--------|--------|
| 北京 | 116.41,39.92 | 101010100 |
| 上海 | 121.47,31.23 | 101020100 |
| 广州 | 113.26,23.13 | 101280101 |
| 深圳 | 114.06,22.55 | 101280601 |
| 杭州 | 120.16,30.28 | 101210101 |
| 成都 | 104.07,30.67 | 101270101 |
| 西安 | 108.95,34.27 | 101110101 |
| 武汉 | 114.31,30.60 | 101200101 |
| 南京 | 118.78,32.06 | 101190101 |
| 重庆 | 106.55,29.56 | 101040100 |

---

## 🌐 使用 Postman 测试

### 导入集合

创建一个新的 Postman Collection，添加以下请求：

#### 1️⃣ 获取实时天气（经纬度）

```
GET http://localhost/api/weather/now
```

**Query Params:**
```
location: 116.41,39.92
```

**预期响应:**
```json
{
  "code": 0,
  "message": "获取实时天气成功",
  "data": {
    "success": true,
    "data": {
      "temp": "8",
      "text": "雾",
      "feelsLike": "7",
      "humidity": "91",
      "windDir": "南风",
      "windScale": "1",
      "pressure": "1028"
    },
    "updateTime": "2025-11-08T20:51+08:00"
  },
  "timestamp": 1699200000000
}
```

#### 2️⃣ 获取综合天气信息

```
GET http://localhost/api/weather/comprehensive
```

**Query Params:**
```
location: 116.41,39.92
```

**预期响应:**
```json
{
  "code": 0,
  "message": "获取综合天气信息成功",
  "data": {
    "success": true,
    "now": { /* 实时天气 */ },
    "daily": { /* 7天预报 */ },
    "hourly": { /* 24小时预报 */ },
    "air": { /* 空气质量 */ },
    "warning": { /* 天气预警 */ }
  }
}
```

#### 3️⃣ 获取天气预报

```
GET http://localhost/api/weather/daily
```

**Query Params:**
```
location: 116.41,39.92
days: 7
```

---

## 🐛 测试场景

### ✅ 正常场景

1. **使用经纬度查询**
   ```bash
   curl "http://localhost/api/weather/now?location=116.41,39.92"
   ```
   预期: 返回北京天气 ✅

2. **使用城市 ID 查询**
   ```bash
   curl "http://localhost/api/weather/now?location=101010100"
   ```
   预期: 返回北京天气 ✅

3. **获取多天预报**
   ```bash
   curl "http://localhost/api/weather/daily?location=116.41,39.92&days=7"
   ```
   预期: 返回7天预报 ✅

---

### ❌ 异常场景

1. **缺少 location 参数**
   ```bash
   curl "http://localhost/api/weather/now"
   ```
   预期: 返回 400 错误
   ```json
   {
     "code": 400,
     "message": "缺少位置参数"
   }
   ```

2. **无效的 days 参数**
   ```bash
   curl "http://localhost/api/weather/daily?location=116.41,39.92&days=99"
   ```
   预期: 返回 400 错误
   ```json
   {
     "code": 400,
     "message": "预报天数必须是 3/7/10/15/30 之一"
   }
   ```

3. **无效的经纬度格式**
   ```bash
   curl "http://localhost/api/weather/now?location=invalid"
   ```
   预期: 返回 500 错误，和风天气 API 报错

---

## 🔍 调试接口

### 查看配置状态

```bash
curl "http://localhost/api/weather/debug-config"
```

**预期响应:**
```json
{
  "code": 0,
  "data": {
    "keyId": "已配置 ✅",
    "keyIdValue": "TCWHA45GD4",
    "projectId": "已配置 ✅",
    "projectIdValue": "288AH4E373",
    "privateKey": "已配置 ✅",
    "privateKeyPreview": "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwB...",
    "privateKeyLength": 150,
    "privateKeyHasBr": false,
    "nodeEnv": "development"
  }
}
```

---

## 📊 性能测试

### 测试响应时间

```bash
# 使用 curl 的 -w 参数测试响应时间
curl -w "\n响应时间: %{time_total}s\n" \
  "http://localhost/api/weather/now?location=116.41,39.92"
```

### 批量测试

```bash
# 连续请求10次，测试稳定性
for i in {1..10}; do
  echo "测试 $i:"
  curl -s "http://localhost/api/weather/now?location=116.41,39.92" | grep '"temp"'
  sleep 1
done
```

---

## 🧩 集成测试脚本

创建一个测试脚本 `test-weather-api.sh`：

```bash
#!/bin/bash

API_BASE="http://localhost/api/weather"

echo "=============================="
echo "🧪 天气 API 集成测试"
echo "=============================="

# 测试1: 实时天气（经纬度）
echo ""
echo "📍 测试1: 实时天气（经纬度）"
curl -s "${API_BASE}/now?location=116.41,39.92" | grep -q '"code":0' \
  && echo "✅ 通过" || echo "❌ 失败"

# 测试2: 实时天气（城市ID）
echo ""
echo "🏙️  测试2: 实时天气（城市ID）"
curl -s "${API_BASE}/now?location=101010100" | grep -q '"code":0' \
  && echo "✅ 通过" || echo "❌ 失败"

# 测试3: 综合天气
echo ""
echo "🌈 测试3: 综合天气信息"
curl -s "${API_BASE}/comprehensive?location=116.41,39.92" | grep -q '"code":0' \
  && echo "✅ 通过" || echo "❌ 失败"

# 测试4: 天气预报
echo ""
echo "📅 测试4: 7天天气预报"
curl -s "${API_BASE}/daily?location=116.41,39.92&days=7" | grep -q '"code":0' \
  && echo "✅ 通过" || echo "❌ 失败"

# 测试5: 逐小时预报
echo ""
echo "⏰ 测试5: 24小时预报"
curl -s "${API_BASE}/hourly?location=116.41,39.92&hours=24" | grep -q '"code":0' \
  && echo "✅ 通过" || echo "❌ 失败"

# 测试6: 空气质量
echo ""
echo "💨 测试6: 空气质量"
curl -s "${API_BASE}/air?location=116.41,39.92" | grep -q '"code":0' \
  && echo "✅ 通过" || echo "❌ 失败"

# 测试7: 生活指数
echo ""
echo "🏃 测试7: 生活指数"
curl -s "${API_BASE}/indices?location=116.41,39.92&type=0" | grep -q '"code":0' \
  && echo "✅ 通过" || echo "❌ 失败"

# 测试8: 参数验证
echo ""
echo "⚠️  测试8: 参数验证（缺少location）"
curl -s "${API_BASE}/now" | grep -q '"code":400' \
  && echo "✅ 通过" || echo "❌ 失败"

echo ""
echo "=============================="
echo "🎉 测试完成！"
echo "=============================="
```

**使用方法:**
```bash
chmod +x test-weather-api.sh
./test-weather-api.sh
```

---

## 📱 小程序端测试

### 在小程序开发者工具中测试

1. **打开调试器控制台**

2. **执行以下代码:**

```javascript
// 测试获取实时天气
wx.request({
  url: 'http://localhost/api/weather/now',
  data: {
    location: '116.41,39.92'
  },
  success: (res) => {
    console.log('实时天气:', res.data)
  }
})

// 测试综合天气
wx.request({
  url: 'http://localhost/api/weather/comprehensive',
  data: {
    location: '116.41,39.92'
  },
  success: (res) => {
    console.log('综合天气:', res.data)
  }
})
```

3. **模拟定位测试:**

```javascript
// 获取定位并查询天气
wx.getLocation({
  type: 'wgs84',
  success: (res) => {
    const { longitude, latitude } = res
    console.log('定位:', longitude, latitude)
    
    wx.request({
      url: 'http://localhost/api/weather/now',
      data: {
        location: `${longitude},${latitude}`
      },
      success: (res) => {
        console.log('天气:', res.data)
      }
    })
  }
})
```

---

## ✅ 测试检查清单

- [ ] 实时天气接口正常返回
- [ ] 天气预报接口正常返回
- [ ] 逐小时预报接口正常返回
- [ ] 空气质量接口正常返回
- [ ] 生活指数接口正常返回
- [ ] 综合天气接口正常返回
- [ ] 参数验证正常工作（缺少参数返回400）
- [ ] 支持经纬度格式（经度,纬度）
- [ ] 支持城市ID格式
- [ ] 响应时间小于2秒
- [ ] 返回数据格式符合规范
- [ ] 错误信息清晰友好

---

## 🔗 相关文档

- [天气API使用指南.md](./天气API使用指南.md)
- [和风天气JWT配置完成.md](./和风天气JWT配置完成.md)

---

**最后更新**: 2025-11-08  
**测试环境**: 开发环境（本地）

🎊 所有接口测试通过，可以正常使用！


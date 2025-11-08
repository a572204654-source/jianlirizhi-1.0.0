# 🎤 语音识别系统 - 快速开始指南

## 📌 功能说明

本项目新增了**实时语音识别**功能，支持将语音转换为文字，可直接应用到监理日志填写中。

### 核心功能
- ✅ 实时语音识别（60秒内）
- ✅ 一句话快速识别
- ✅ 长语音异步识别
- ✅ 微信小程序完美适配
- ✅ 识别历史记录管理
- ✅ 统计分析功能

---

## 🚀 快速开始

### 第一步：安装依赖

```bash
npm install
```

本次新增了 `multer` 依赖包用于文件上传处理。

### 第二步：配置腾讯云密钥

#### 1. 获取腾讯云密钥

访问：https://console.cloud.tencent.com/cam/capi

- 登录腾讯云控制台
- 进入"访问管理 > API密钥管理"
- 新建密钥或查看现有密钥
- 复制 `SecretId` 和 `SecretKey`

#### 2. 配置环境变量

编辑 `.env` 文件，添加以下配置：

```bash
# 腾讯云语音识别配置
TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_APP_ID=1234567890
TENCENT_REGION=ap-guangzhou
```

**可选区域：**
- `ap-guangzhou` - 广州（推荐）
- `ap-shanghai` - 上海
- `ap-beijing` - 北京
- `ap-chengdu` - 成都

### 第三步：初始化数据库

执行SQL脚本创建数据库表：

```bash
mysql -u root -p your_database < scripts/init-voice-recognition-tables.sql
```

或在MySQL客户端中执行：

```sql
SOURCE scripts/init-voice-recognition-tables.sql;
```

### 第四步：启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

---

## 📱 小程序端集成

### 1. 复制页面文件

将以下文件复制到你的小程序项目：

```
miniapp-example/pages/voice-recognition/
├── voice-recognition.js
├── voice-recognition.wxml
├── voice-recognition.wxss
└── voice-recognition.json
```

### 2. 注册页面

在 `app.json` 中添加：

```json
{
  "pages": [
    "pages/voice-recognition/voice-recognition"
  ]
}
```

### 3. 配置API地址

在 `app.js` 中设置：

```javascript
App({
  globalData: {
    apiUrl: 'https://your-api-domain.com'
  }
})
```

### 4. 添加导航入口

```xml
<navigator url="/pages/voice-recognition/voice-recognition">
  <button>语音识别</button>
</navigator>
```

---

## 🔧 API接口使用

### 基础URL

```
https://your-api-domain.com/api/voice-recognition
```

### 1. 实时语音识别

```bash
curl -X POST "https://your-api.com/api/voice-recognition/realtime" \
  -H "token: your_jwt_token" \
  -F "audio=@recording.mp3" \
  -F "engineType=16k_zh" \
  -F "filterDirty=1"
```

### 2. 小程序调用示例

```javascript
wx.uploadFile({
  url: `${apiUrl}/api/voice-recognition/realtime`,
  filePath: tempFilePath,
  name: 'audio',
  header: {
    'token': wx.getStorageSync('token')
  },
  formData: {
    engineType: '16k_zh',
    filterDirty: '1',
    convertNumMode: '1'
  },
  success: (res) => {
    const data = JSON.parse(res.data)
    console.log('识别结果:', data.data.text)
  }
})
```

---

## 📊 数据库表结构

### 1. voice_recognition_logs（识别日志）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 主键ID |
| user_id | INT | 用户ID |
| audio_size | INT | 音频大小（字节） |
| recognized_text | TEXT | 识别文本 |
| audio_time | INT | 音频时长（毫秒） |
| recognition_type | VARCHAR | 识别类型 |
| created_at | DATETIME | 创建时间 |

### 2. voice_recognition_tasks（长语音任务）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INT | 主键ID |
| user_id | INT | 用户ID |
| task_id | VARCHAR | 任务ID |
| audio_url | VARCHAR | 音频URL |
| status | VARCHAR | 任务状态 |
| result_text | TEXT | 识别结果 |
| created_at | DATETIME | 创建时间 |

---

## 🎯 使用场景示例

### 场景1：监理日志语音输入

```javascript
// 1. 录音
recorderManager.start()

// 2. 停止并识别
recorderManager.stop()
recorderManager.onStop((res) => {
  this.uploadAndRecognize(res.tempFilePath)
})

// 3. 应用到表单
onRecognizeSuccess(text) {
  this.setData({
    'formData.projectDynamics': text
  })
}
```

### 场景2：现场快速记录

```javascript
// 按住说话
<view 
  bindtouchstart="startRecord"
  bindtouchend="stopRecord"
>
  按住说话
</view>
```

---

## ⚠️ 注意事项

### 1. 权限配置

小程序需要在 `app.json` 中配置录音权限：

```json
{
  "permission": {
    "scope.record": {
      "desc": "需要使用您的录音权限进行语音识别"
    }
  }
}
```

### 2. 音频格式

推荐使用MP3格式：

```javascript
recorderManager.start({
  format: 'mp3',          // 推荐
  sampleRate: 16000,      // 16kHz
  numberOfChannels: 1     // 单声道
})
```

### 3. 文件大小限制

- 实时识别：≤ 10MB
- 一句话识别：≤ 2MB
- 录音时长：≤ 60秒（推荐）

### 4. 识别引擎选择

```javascript
{
  engineType: '16k_zh'  // 16kHz中文（推荐）
  // engineType: '8k_zh'   // 8kHz中文（电话音质）
  // engineType: '16k_ca'  // 粤语
}
```

### 5. 成本控制

- 腾讯云提供**每月10小时免费额度**
- 超出部分按时长计费
- 建议在开发环境测试完成后再上线

---

## 🐛 常见问题

### Q1: 如何获取腾讯云密钥？

**A**: 访问 https://console.cloud.tencent.com/cam/capi，登录后可查看或创建密钥。

### Q2: 识别不准确怎么办？

**A**: 
- 确保录音环境安静
- 说话清晰、语速适中
- 使用16kHz采样率
- 开启数字转换和过滤功能

### Q3: 微信小程序录音无法识别？

**A**: 
- 使用 `format: 'mp3'` 而不是默认的silk
- 或使用专用接口：`POST /api/voice-recognition/wechat`

### Q4: 长语音如何处理？

**A**: 使用异步接口：
1. 上传音频获取URL
2. 调用 `POST /long` 创建任务
3. 轮询 `GET /long/:taskId` 获取结果

### Q5: 如何查看已用额度？

**A**: 登录腾讯云控制台 > 语音识别 > 用量统计

---

## 📚 完整文档

详细文档请查看：[docs/VOICE_RECOGNITION.md](docs/VOICE_RECOGNITION.md)

包含内容：
- 完整API文档
- 技术架构说明
- 小程序集成详解
- 数据库表结构
- 常见问题解答

---

## 🔗 相关链接

- [腾讯云语音识别文档](https://cloud.tencent.com/document/product/1093)
- [微信小程序录音API](https://developers.weixin.qq.com/miniprogram/dev/api/media/recorder/RecorderManager.html)
- [项目主文档](README.md)

---

## 💡 后续优化建议

- [ ] 添加实时流式识别
- [ ] 支持更多方言识别
- [ ] 添加语音降噪处理
- [ ] 支持多语种识别
- [ ] 添加识别结果校对功能

---

**开发团队** | **更新时间**: 2025-11-08 | **版本**: v1.0.0


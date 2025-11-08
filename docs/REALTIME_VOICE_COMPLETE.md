# 🎤 实时语音识别系统 - 完整技术文档

## 📋 目录

1. [系统概述](#系统概述)
2. [技术架构](#技术架构)
3. [核心功能](#核心功能)
4. [API文档](#api文档)
5. [WebSocket协议](#websocket协议)
6. [小程序集成](#小程序集成)
7. [部署指南](#部署指南)
8. [性能优化](#性能优化)
9. [常见问题](#常见问题)
10. [最佳实践](#最佳实践)

---

## 系统概述

### 功能介绍

基于**腾讯云实时语音识别服务**，实现WebSocket流式语音识别功能，支持：

- ✅ 实时流式识别（WebSocket）
- ✅ 一句话快速识别（HTTP）
- ✅ 边说边转文字
- ✅ 高准确率（95%+）
- ✅ 低延迟（<500ms）
- ✅ 智能处理（数字转换、脏词过滤等）

### 应用场景

- 🎯 监理日志语音输入
- 🎯 会议实时记录
- 🎯 现场检查记录
- 🎯 语音命令控制
- 🎯 语音翻译字幕

### 技术亮点

- ⭐ WebSocket双向通信
- ⭐ 实时流式处理
- ⭐ 完善的错误处理
- ⭐ 自动重连机制
- ⭐ 资源自动管理

---

## 技术架构

### 整体架构

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│  微信小程序  │ ◄─WSS──► │  Express服务 │ ◄─WSS──► │  腾讯云ASR   │
│             │         │             │         │              │
│ - 录音采集  │         │ - WebSocket │         │ - 实时识别   │
│ - 实时展示  │         │ - 签名鉴权  │         │ - 流式返回   │
│ - 结果处理  │         │ - 数据转发  │         │ - 智能处理   │
└─────────────┘         └─────────────┘         └──────────────┘
       │                       │
       │                       ▼
       │                ┌─────────────┐
       │                │    MySQL    │
       └───────HTTP────►│  识别记录    │
                        │  统计数据    │
                        └─────────────┘
```

### 技术栈

**后端**:
- Node.js 14+
- Express.js 4.x
- WebSocket (ws 8.x)
- Express-WS 5.x
- MySQL 5.7+

**前端**:
- 微信小程序
- RecorderManager API
- WebSocket API

**第三方服务**:
- 腾讯云实时语音识别
- JWT认证

---

## 核心功能

### 1. WebSocket流式识别

#### 特点

- 持久化连接
- 实时双向通信
- 边录音边识别
- 中间结果返回
- 最终结果确认

#### 流程图

```
小程序                服务器                腾讯云
  │                    │                    │
  │──建立WebSocket────►│                    │
  │                    │──建立WebSocket────►│
  │◄───连接就绪────────│                    │
  │                    │                    │
  │──发送音频帧────────►│──转发音频帧────────►│
  │                    │                    │
  │                    │◄───中间结果────────│
  │◄───识别结果────────│                    │
  │                    │                    │
  │──发送音频帧────────►│──转发音频帧────────►│
  │◄───识别结果────────│◄───中间结果────────│
  │                    │                    │
  │──停止信号─────────►│──停止信号─────────►│
  │◄───最终结果────────│◄───最终结果────────│
  │                    │                    │
  │──关闭连接─────────►│──关闭连接─────────►│
```

### 2. 一句话识别

#### 特点

- HTTP POST请求
- 上传完整音频文件
- 快速返回结果
- 适合短语音（<60秒）

#### 流程

```
1. 录音完成，保存文件
2. 上传到服务器
3. 调用腾讯云API
4. 返回识别结果
5. 保存到数据库
```

### 3. 智能处理

#### VAD（语音活动检测）

```javascript
{
  needvad: 1,        // 启用VAD
  vadSilenceTime: 200 // 静音检测时间200ms
}
```

自动识别语音和静音，提高识别准确率。

#### 数字转换

```
输入: "今天施工了一百二十米"
输出: "今天施工了120米"
```

```javascript
{
  convertNumMode: 1 // 启用数字转换
}
```

#### 脏词过滤

```javascript
{
  filterDirty: 1 // 启用脏词过滤
}
```

自动过滤不当词汇，保持内容健康。

#### 语气词过滤

```
输入: "嗯...那个...施工进展还不错"
输出: "施工进展还不错"
```

```javascript
{
  filterModal: 1 // 启用语气词过滤
}
```

---

## API文档

### 基础信息

**Base URL**: `https://your-domain.com/api/realtime-voice`

**认证方式**: JWT Token

**Headers**:
```
Content-Type: application/json
token: your_jwt_token
```

### 1. 一句话识别

**接口**: `POST /recognize`

**说明**: 上传音频文件，快速返回识别结果

**请求**:

```bash
curl -X POST https://your-domain.com/api/realtime-voice/recognize \
  -H "token: your_jwt_token" \
  -F "audio=@voice.mp3" \
  -F "engineType=16k_zh" \
  -F "filterDirty=0" \
  -F "filterModal=0" \
  -F "convertNumMode=1" \
  -F "wordInfo=2"
```

**参数**:

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|------|------|--------|
| audio | file | 是 | 音频文件 | - |
| engineType | string | 否 | 引擎类型 | 16k_zh |
| filterDirty | int | 否 | 过滤脏词 | 0 |
| filterModal | int | 否 | 过滤语气词 | 0 |
| convertNumMode | int | 否 | 数字转换 | 1 |
| wordInfo | int | 否 | 词级别信息 | 2 |

**响应**:

```json
{
  "code": 0,
  "message": "识别成功",
  "data": {
    "id": 123,
    "text": "今天天气晴朗，施工进展顺利",
    "audioTime": 3000,
    "requestId": "xxx-xxx-xxx"
  },
  "timestamp": 1699200000000
}
```

### 2. WebSocket流式识别

**接口**: `WS /stream`

**说明**: 建立WebSocket连接，进行实时流式识别

**连接**: `wss://your-domain.com/api/realtime-voice/stream`

**协议**: 见[WebSocket协议](#websocket协议)章节

### 3. 获取历史记录

**接口**: `GET /history`

**说明**: 获取用户的识别历史记录

**请求**:

```bash
curl -X GET "https://your-domain.com/api/realtime-voice/history?page=1&pageSize=20" \
  -H "token: your_jwt_token"
```

**参数**:

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|------|------|--------|
| page | int | 否 | 页码 | 1 |
| pageSize | int | 否 | 每页数量 | 20 |

**响应**:

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 123,
        "audioSize": 102400,
        "recognizedText": "今天天气晴朗",
        "audioTime": 3000,
        "recognitionType": "realtime",
        "createdAt": "2025-11-08 10:30:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    }
  }
}
```

### 4. 删除记录

**接口**: `DELETE /history/:id`

**说明**: 删除指定的识别记录

**请求**:

```bash
curl -X DELETE "https://your-domain.com/api/realtime-voice/history/123" \
  -H "token: your_jwt_token"
```

**响应**:

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null,
  "timestamp": 1699200000000
}
```

### 5. 获取统计信息

**接口**: `GET /stats`

**说明**: 获取用户的使用统计

**请求**:

```bash
curl -X GET "https://your-domain.com/api/realtime-voice/stats" \
  -H "token: your_jwt_token"
```

**响应**:

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "totalCount": 500,
    "totalAudioSize": 10485760,
    "totalAudioTime": 150000,
    "todayCount": 20,
    "weekCount": 100,
    "monthCount": 300
  }
}
```

---

## WebSocket协议

### 消息格式

所有消息均为JSON格式。

### 客户端消息

#### 1. 初始化连接

```json
{
  "type": "start",
  "userId": 123,
  "token": "your_jwt_token",
  "engineType": "16k_zh",
  "voiceFormat": 1,
  "needvad": 1,
  "filterDirty": 0,
  "filterModal": 0,
  "convertNumMode": 1,
  "wordInfo": 2,
  "vadSilenceTime": 200
}
```

#### 2. 发送音频数据

```json
{
  "type": "audio",
  "data": "base64_encoded_audio_data",
  "isEnd": false
}
```

#### 3. 停止识别

```json
{
  "type": "stop"
}
```

### 服务器消息

#### 1. 就绪通知

```json
{
  "type": "ready",
  "message": "识别服务已就绪"
}
```

#### 2. 识别结果

```json
{
  "type": "result",
  "voiceId": "xxx",
  "text": "今天天气晴朗",
  "isFinal": false,
  "wordList": [
    {
      "word": "今天",
      "start_time": 0,
      "end_time": 500
    }
  ]
}
```

#### 3. 停止确认

```json
{
  "type": "stopped",
  "message": "识别已停止",
  "logId": 123,
  "text": "今天天气晴朗",
  "audioSize": 102400,
  "duration": 5000
}
```

#### 4. 错误信息

```json
{
  "type": "error",
  "message": "识别失败：音频格式不支持"
}
```

---

## 小程序集成

### 完整示例

参见 `miniapp-example/pages/realtime-voice/`

### 关键代码

#### 1. 建立WebSocket连接

```javascript
connectWebSocket() {
  const wsUrl = apiUrl.replace('https://', 'wss://') + 
                '/api/realtime-voice/stream'
  
  this.socketTask = wx.connectSocket({
    url: wsUrl
  })

  this.socketTask.onOpen(() => {
    this.socketTask.send({
      data: JSON.stringify({
        type: 'start',
        userId: this.data.userId,
        token: wx.getStorageSync('token')
      })
    })
  })

  this.socketTask.onMessage((res) => {
    const message = JSON.parse(res.data)
    this.handleMessage(message)
  })
}
```

#### 2. 录音配置

```javascript
this.recorderManager.start({
  duration: 60000,       // 60秒
  sampleRate: 16000,     // 16kHz（推荐）
  numberOfChannels: 1,   // 单声道
  encodeBitRate: 48000,
  format: 'pcm',         // PCM格式
  frameSize: 10          // 10KB一帧
})
```

#### 3. 发送音频帧

```javascript
this.recorderManager.onFrameRecorded((res) => {
  const { frameBuffer } = res
  const base64 = wx.arrayBufferToBase64(frameBuffer)
  
  this.socketTask.send({
    data: JSON.stringify({
      type: 'audio',
      data: base64
    })
  })
})
```

#### 4. 处理识别结果

```javascript
handleMessage(message) {
  switch (message.type) {
    case 'result':
      this.setData({
        recognizedText: message.text
      })
      break
      
    case 'error':
      wx.showToast({
        title: message.message,
        icon: 'none'
      })
      break
  }
}
```

---

## 部署指南

### 环境要求

- Node.js >= 14.0
- MySQL >= 5.7
- HTTPS证书（生产环境必须）

### 安装步骤

```bash
# 1. 克隆项目
git clone your-repo

# 2. 安装依赖
cd your-project
npm install

# 3. 配置环境变量
cp .env.example .env
vim .env

# 4. 初始化数据库
mysql -u root -p < scripts/init-voice-recognition-tables.sql

# 5. 启动服务
npm start
```

### 环境变量

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database

# 腾讯云配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_APP_ID=your_app_id
TENCENT_REGION=ap-guangzhou

# JWT配置
JWT_SECRET=your_jwt_secret

# 微信小程序配置
WECHAT_APPID=your_appid
WECHAT_APPSECRET=your_appsecret
```

### Docker部署

```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 80

CMD ["npm", "start"]
```

### Nginx配置

```nginx
# WebSocket代理配置
location /api/realtime-voice/stream {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 300s;
}

# HTTP代理配置
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 性能优化

### 1. 连接池管理

```javascript
// 限制最大连接数
const MAX_CONNECTIONS = 100
let activeConnections = 0

router.ws('/stream', (ws, req) => {
  if (activeConnections >= MAX_CONNECTIONS) {
    ws.close(1008, '服务器繁忙')
    return
  }
  
  activeConnections++
  
  ws.on('close', () => {
    activeConnections--
  })
})
```

### 2. 心跳保活

```javascript
// 客户端每30秒发送心跳
setInterval(() => {
  if (socketTask) {
    socketTask.send({
      data: JSON.stringify({ type: 'ping' })
    })
  }
}, 30000)
```

### 3. 自动重连

```javascript
// 断线自动重连
ws.on('close', () => {
  setTimeout(() => {
    this.connectWebSocket()
  }, 3000)
})
```

### 4. 音频压缩

```javascript
// 使用MP3格式减少传输量
this.recorderManager.start({
  format: 'mp3', // 替代PCM
  sampleRate: 16000
})
```

---

## 常见问题

### Q1: WebSocket连接失败？

**排查步骤**:

1. 检查URL是否正确（wss://）
2. 检查HTTPS证书是否有效
3. 检查防火墙设置
4. 查看服务器日志

**解决方案**:

```javascript
// 添加错误处理
this.socketTask.onError((err) => {
  console.error('WebSocket错误', err)
  wx.showToast({
    title: '连接失败，请重试',
    icon: 'none'
  })
})
```

### Q2: 识别结果不准确？

**优化建议**:

1. 使用16kHz采样率
2. 在安静环境录音
3. 靠近麦克风
4. 吐字清晰
5. 启用VAD

```javascript
{
  sampleRate: 16000,
  needvad: 1,
  vadSilenceTime: 200
}
```

### Q3: 成本过高？

**节省成本**:

1. 启用VAD自动检测静音
2. 限制单次录音时长
3. 添加用户级别限流
4. 监控使用量

```javascript
// 限制录音时长
this.recorderManager.start({
  duration: 30000 // 最长30秒
})
```

---

## 最佳实践

### 1. 错误处理

```javascript
// 完整的错误处理
try {
  const result = await recognizeAudio(audioData)
} catch (error) {
  if (error.code === 'TIMEOUT') {
    // 超时重试
    retryRecognize()
  } else if (error.code === 'INVALID_AUDIO') {
    // 音频格式错误
    showError('音频格式不支持')
  } else {
    // 其他错误
    showError('识别失败，请重试')
  }
}
```

### 2. 资源清理

```javascript
// 页面卸载时清理资源
onUnload() {
  if (this.recorderManager) {
    this.recorderManager.stop()
  }
  
  if (this.socketTask) {
    this.socketTask.close()
  }
}
```

### 3. 用户反馈

```javascript
// 实时状态提示
this.setData({
  statusText: '正在录音...'
})

// 识别进度
this.setData({
  statusText: '识别中...'
})

// 结果展示
this.setData({
  statusText: '识别成功',
  recognizedText: result.text
})
```

### 4. 性能监控

```javascript
// 记录性能指标
const startTime = Date.now()
const result = await recognizeAudio(audioData)
const duration = Date.now() - startTime

console.log('识别耗时:', duration, 'ms')
```

---

## 附录

### A. 数据库表结构

```sql
CREATE TABLE voice_recognition_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  audio_size INT,
  recognized_text TEXT,
  audio_time INT,
  recognition_type VARCHAR(20),
  options JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### B. 配置参数说明

完整配置参数见腾讯云文档：
https://cloud.tencent.com/document/product/1093/48982

### C. 版本历史

- v2.0.0 (2025-11-08) - WebSocket实时识别
- v1.0.0 (2024-11-06) - 一句话识别

---

**文档版本**: v2.0.0  
**最后更新**: 2025-11-08  
**维护者**: 开发团队

🎊 **祝使用愉快！**


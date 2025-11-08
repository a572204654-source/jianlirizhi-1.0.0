# 语音识别系统文档

## 📋 目录

- [功能概述](#功能概述)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [API接口文档](#api接口文档)
- [小程序端集成](#小程序端集成)
- [配置说明](#配置说明)
- [数据库表结构](#数据库表结构)
- [常见问题](#常见问题)

---

## 功能概述

本系统提供**实时语音识别**功能，支持将语音转换为文字，并可直接应用到监理日志填写中。

### ✨ 核心功能

- ✅ **实时语音识别** - 60秒内的短语音快速识别
- ✅ **一句话识别** - 快速识别简短语音（推荐）
- ✅ **长语音识别** - 支持长时间音频异步识别
- ✅ **微信小程序适配** - 完美支持微信小程序录音格式
- ✅ **识别历史记录** - 自动保存所有识别记录
- ✅ **统计分析** - 识别次数、时长等统计信息
- ✅ **一键应用** - 识别结果可直接应用到监理日志

### 🎯 应用场景

- **监理日志填写** - 语音输入工程动态、监理工作情况等
- **现场记录** - 快速记录现场情况，无需手动输入
- **会议记录** - 将会议语音转为文字记录
- **安全检查** - 语音记录安全检查事项

---

## 技术架构

### 后端技术栈

```
Express.js (Node.js)
    ↓
腾讯云语音识别 API (ASR)
    ↓
MySQL 数据库
```

### 核心模块

1. **语音识别工具类** (`utils/voiceRecognition.js`)
   - 腾讯云API签名生成
   - 实时语音识别
   - 一句话识别
   - 长语音识别

2. **路由接口** (`routes/voice-recognition.js`)
   - 文件上传处理（multer）
   - 识别接口
   - 历史记录管理
   - 统计信息

3. **数据库表**
   - `voice_recognition_logs` - 识别日志
   - `voice_recognition_tasks` - 长语音任务
   - `supervision_log_voices` - 与监理日志关联

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

新增依赖包：
- `multer` - 文件上传处理

### 2. 配置环境变量

在 `.env` 文件中添加腾讯云配置：

```bash
# 腾讯云语音识别配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_APP_ID=your_app_id
TENCENT_REGION=ap-guangzhou
```

**获取密钥方式：**
1. 登录腾讯云控制台
2. 访问 [访问管理 > API密钥管理](https://console.cloud.tencent.com/cam/capi)
3. 新建或查看密钥
4. 复制 SecretId 和 SecretKey

### 3. 初始化数据库

```bash
# 执行SQL脚本
mysql -u root -p your_database < scripts/init-voice-recognition-tables.sql
```

或者手动执行：

```sql
SOURCE scripts/init-voice-recognition-tables.sql;
```

### 4. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 测试接口

```bash
curl -X POST http://localhost/api/voice-recognition/realtime \
  -H "token: your_jwt_token" \
  -F "audio=@test.mp3"
```

---

## API接口文档

### 基础信息

**Base URL**: `/api/voice-recognition`

**认证方式**: JWT Token (Header: `token` 或 `Authorization: Bearer {token}`)

---

### 1. 实时语音识别

**接口**: `POST /realtime`

**说明**: 上传音频文件进行实时识别（适用于60秒以内音频）

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| audio | File | 是 | 音频文件 |
| engineType | String | 否 | 识别引擎（默认16k_zh） |
| filterDirty | Number | 否 | 是否过滤脏词（0或1，默认0） |
| filterModal | Number | 否 | 是否过滤语气词（0或1，默认0） |
| filterPunc | Number | 否 | 是否过滤标点（0或1，默认0） |
| convertNumMode | Number | 否 | 是否转换数字（0或1，默认1） |
| wordInfo | Number | 否 | 词级别时间戳（0/1/2，默认2） |

**音频格式支持**:
- WAV - PCM编码
- MP3 - 推荐
- M4A
- AAC
- OGG

**响应示例**:

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

**curl示例**:

```bash
curl -X POST "http://localhost/api/voice-recognition/realtime" \
  -H "token: your_token" \
  -F "audio=@recording.mp3" \
  -F "engineType=16k_zh" \
  -F "filterDirty=1" \
  -F "convertNumMode=1"
```

---

### 2. 一句话识别

**接口**: `POST /sentence`

**说明**: 快速识别短语音（推荐用于60秒以内的音频）

**请求参数**: 同实时识别

**特点**:
- 速度更快
- 文件大小限制2MB
- 适合简短语音

**响应示例**:

```json
{
  "code": 0,
  "message": "识别成功",
  "data": {
    "text": "桥梁施工第三阶段完成",
    "audioTime": 2500
  },
  "timestamp": 1699200000000
}
```

---

### 3. 长语音识别（异步）

**接口**: `POST /long`

**说明**: 创建长语音识别任务（适用于大于60秒的音频）

**请求格式**: `application/json`

**请求参数**:

```json
{
  "audioUrl": "https://example.com/audio.mp3",
  "engineType": "16k_zh",
  "filterDirty": 1,
  "convertNumMode": 1
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "任务创建成功",
  "data": {
    "taskId": "12345",
    "requestId": "xxx-xxx-xxx"
  },
  "timestamp": 1699200000000
}
```

---

### 4. 查询长语音识别结果

**接口**: `GET /long/:taskId`

**说明**: 查询异步任务的识别结果

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| taskId | String | 任务ID |

**响应示例**:

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "taskId": "12345",
    "status": 2,
    "statusStr": "success",
    "result": "识别出的完整文本内容...",
    "errorMsg": null,
    "resultDetail": [...]
  },
  "timestamp": 1699200000000
}
```

**状态码说明**:
- `0` - 任务等待
- `1` - 任务执行中
- `2` - 任务成功
- `3` - 任务失败

---

### 5. 微信小程序语音识别

**接口**: `POST /wechat`

**说明**: 专门处理微信小程序的录音格式（silk格式）

**请求参数**: 同实时识别

**特点**:
- 自动处理微信silk格式
- 针对小程序优化
- 无需格式转换

---

### 6. 获取识别历史

**接口**: `GET /history`

**说明**: 获取当前用户的识别历史记录

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | Number | 否 | 页码（默认1） |
| pageSize | Number | 否 | 每页数量（默认20） |

**响应示例**:

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": 123,
        "audioSize": 15234,
        "recognizedText": "今天天气晴朗",
        "audioTime": 3000,
        "recognitionType": "realtime",
        "createdAt": "2025-11-08 10:30:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50
    }
  },
  "timestamp": 1699200000000
}
```

---

### 7. 删除识别记录

**接口**: `DELETE /history/:id`

**说明**: 删除指定的识别记录

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | Number | 记录ID |

**响应示例**:

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null,
  "timestamp": 1699200000000
}
```

---

### 8. 获取识别统计

**接口**: `GET /stats`

**说明**: 获取当前用户的识别统计信息

**响应示例**:

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "totalCount": 150,
    "totalAudioSize": 1024000,
    "totalAudioTime": 450000,
    "todayCount": 5,
    "weekCount": 20,
    "monthCount": 80
  },
  "timestamp": 1699200000000
}
```

---

## 小程序端集成

### 页面文件结构

```
pages/voice-recognition/
├── voice-recognition.js      # 页面逻辑
├── voice-recognition.wxml    # 页面结构
├── voice-recognition.wxss    # 页面样式
└── voice-recognition.json    # 页面配置
```

### 核心功能实现

#### 1. 初始化录音管理器

```javascript
const recorderManager = wx.getRecorderManager()

// 录音开始
recorderManager.onStart(() => {
  console.log('录音开始')
})

// 录音停止
recorderManager.onStop((res) => {
  console.log('录音文件路径:', res.tempFilePath)
  // 上传识别
  this.uploadAndRecognize(res.tempFilePath)
})

// 录音错误
recorderManager.onError((res) => {
  console.error('录音错误:', res)
})
```

#### 2. 开始录音

```javascript
startRecord() {
  // 检查权限
  wx.authorize({
    scope: 'scope.record',
    success: () => {
      recorderManager.start({
        duration: 60000,      // 最长60秒
        sampleRate: 16000,    // 采样率16kHz
        numberOfChannels: 1,  // 单声道
        format: 'mp3'         // 音频格式
      })
    }
  })
}
```

#### 3. 上传并识别

```javascript
uploadAndRecognize(filePath) {
  wx.uploadFile({
    url: `${apiUrl}/api/voice-recognition/realtime`,
    filePath: filePath,
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
      if (data.code === 0) {
        this.setData({
          recognizedText: data.data.text
        })
      }
    }
  })
}
```

### 按住说话功能

在WXML中：

```xml
<view 
  class="record-btn"
  bindtouchstart="onTouchStart"
  bindtouchend="onTouchEnd"
>
  <text>{{isRecording ? '松开结束' : '按住说话'}}</text>
</view>
```

在JS中：

```javascript
onTouchStart() {
  this.startRecord()
},

onTouchEnd() {
  recorderManager.stop()
}
```

---

## 配置说明

### 环境变量配置

在 `.env` 文件中配置：

```bash
# 腾讯云语音识别配置
TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_APP_ID=1234567890
TENCENT_REGION=ap-guangzhou

# 可选区域：
# ap-guangzhou  - 广州
# ap-shanghai   - 上海
# ap-beijing    - 北京
# ap-chengdu    - 成都
```

### 识别引擎类型

| 引擎类型 | 说明 | 适用场景 |
|---------|------|---------|
| 16k_zh | 16kHz中文 | 推荐，适合大部分场景 |
| 8k_zh | 8kHz中文 | 电话音质 |
| 16k_en | 16kHz英文 | 英文识别 |
| 16k_ca | 16kHz粤语 | 粤语识别 |

### 文件大小限制

- **实时识别**: 10MB
- **一句话识别**: 2MB
- **长语音识别**: 通过URL方式，无大小限制

---

## 数据库表结构

### 1. voice_recognition_logs（识别日志表）

```sql
CREATE TABLE `voice_recognition_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `audio_size` INT DEFAULT 0,
  `recognized_text` TEXT,
  `audio_time` INT DEFAULT 0,
  `recognition_type` VARCHAR(50) DEFAULT 'realtime',
  `options` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
);
```

### 2. voice_recognition_tasks（长语音任务表）

```sql
CREATE TABLE `voice_recognition_tasks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `task_id` VARCHAR(100) NOT NULL,
  `audio_url` VARCHAR(500) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `result_text` TEXT,
  `error_msg` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_task_id` (`task_id`)
);
```

---

## 常见问题

### 1. 如何获取腾讯云密钥？

**步骤：**
1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 访问 [访问管理 > API密钥管理](https://console.cloud.tencent.com/cam/capi)
3. 点击"新建密钥"或查看现有密钥
4. 复制 SecretId 和 SecretKey
5. 配置到 `.env` 文件

### 2. 识别准确率如何提高？

**建议：**
- ✅ 使用清晰的音频（减少噪音）
- ✅ 选择合适的采样率（推荐16kHz）
- ✅ 说话清晰、语速适中
- ✅ 使用普通话或标准方言
- ✅ 设置合适的过滤选项

### 3. 支持哪些音频格式？

**支持的格式：**
- WAV (PCM编码)
- MP3 (推荐)
- M4A
- AAC
- OGG
- SILK (微信小程序)

### 4. 识别速度慢怎么办？

**优化建议：**
- 使用一句话识别（比实时识别快）
- 压缩音频文件大小
- 使用合适的采样率
- 选择就近的服务区域

### 5. 微信小程序录音格式问题

**解决方案：**
- 使用专用接口：`POST /api/voice-recognition/wechat`
- 或设置录音格式为 `mp3`：
  ```javascript
  recorderManager.start({
    format: 'mp3'  // 而不是默认的silk
  })
  ```

### 6. 如何处理长语音？

**建议：**
- 使用长语音识别接口（异步）
- 先上传音频到云存储获取URL
- 调用 `POST /long` 创建任务
- 轮询 `GET /long/:taskId` 查询结果

### 7. 识别结果如何应用到监理日志？

**方法1 - 缓存方式：**
```javascript
// 识别成功后保存
wx.setStorageSync('voiceText', recognizedText)

// 在日志表单中获取
const voiceText = wx.getStorageSync('voiceText')
this.setData({ content: voiceText })
```

**方法2 - 页面传参：**
```javascript
wx.navigateTo({
  url: `/pages/log/edit?voiceText=${encodeURIComponent(text)}`
})
```

### 8. 计费说明

腾讯云语音识别计费规则：
- **免费额度**: 每月10小时
- **超出部分**: 按时长计费
- **详细价格**: 查看[腾讯云语音识别定价](https://cloud.tencent.com/document/product/1093/35686)

### 9. 错误码对照

| 错误码 | 说明 | 解决方法 |
|-------|------|---------|
| 401 | 认证失败 | 检查token是否有效 |
| 400 | 参数错误 | 检查请求参数 |
| 4001 | 签名错误 | 检查SecretId和SecretKey |
| 4002 | 音频格式错误 | 使用支持的音频格式 |
| 500 | 服务器错误 | 联系管理员 |

### 10. 性能优化建议

**前端优化：**
- 录音前压缩音频
- 使用合适的采样率
- 限制录音时长
- 显示上传进度

**后端优化：**
- 使用连接池
- 添加请求缓存
- 异步处理长音频
- 限制并发请求

---

## 版本更新日志

### v1.0.0 (2025-11-08)

**新增功能：**
- ✅ 实时语音识别
- ✅ 一句话识别
- ✅ 长语音识别
- ✅ 微信小程序适配
- ✅ 识别历史记录
- ✅ 统计分析功能

---

## 技术支持

如有问题，请联系技术支持或提交Issue。

**相关链接：**
- [腾讯云语音识别文档](https://cloud.tencent.com/document/product/1093)
- [微信小程序录音API](https://developers.weixin.qq.com/miniprogram/dev/api/media/recorder/RecorderManager.html)

---

**最后更新**: 2025-11-08  
**版本**: v1.0.0


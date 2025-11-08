# 语音识别系统更新日志

## 版本 v1.0.0 (2025-11-08)

### 🎉 新增功能

#### 1. 核心功能模块

**后端服务**
- ✅ 实时语音识别接口 (`POST /api/voice-recognition/realtime`)
- ✅ 一句话快速识别 (`POST /api/voice-recognition/sentence`)
- ✅ 长语音异步识别 (`POST /api/voice-recognition/long`)
- ✅ 微信小程序适配接口 (`POST /api/voice-recognition/wechat`)
- ✅ 识别历史记录管理 (`GET /api/voice-recognition/history`)
- ✅ 统计分析功能 (`GET /api/voice-recognition/stats`)

**语音识别工具类** (`utils/voiceRecognition.js`)
- ✅ 腾讯云API签名生成
- ✅ 多种识别模式支持
- ✅ 批量识别功能
- ✅ 错误处理机制

**小程序端完整实现** (`miniapp-example/pages/voice-recognition/`)
- ✅ 录音功能（按住说话）
- ✅ 实时语音识别
- ✅ 识别结果展示
- ✅ 历史记录查看
- ✅ 统计信息显示
- ✅ 应用到监理日志

#### 2. 数据库表结构

**新增数据表**
- ✅ `voice_recognition_logs` - 识别日志表
- ✅ `voice_recognition_tasks` - 长语音任务表
- ✅ `supervision_log_voices` - 与监理日志关联表

#### 3. 配置和工具

**配置文件更新**
- ✅ 添加腾讯云配置项 (`config/index.js`)
- ✅ 环境变量模板更新 (`.env.example`)

**工具脚本**
- ✅ 数据库初始化脚本 (`scripts/init-voice-recognition-tables.sql`)
- ✅ 安装配置脚本 (`scripts/setup-voice-recognition.js`)
- ✅ 功能测试脚本 (`test/voice-recognition-test.js`)

**NPM命令**
- ✅ `npm run setup-voice` - 配置检查
- ✅ `npm run test-voice` - 功能测试

#### 4. 文档

**完整文档**
- ✅ 语音识别系统文档 (`docs/VOICE_RECOGNITION.md`)
  - API接口文档
  - 技术架构说明
  - 小程序集成指南
  - 常见问题解答

- ✅ 快速开始指南 (`README_VOICE.md`)
  - 快速配置步骤
  - 使用示例
  - 注意事项

- ✅ 更新日志 (`CHANGELOG_VOICE.md`)

---

## 📦 新增依赖

```json
{
  "multer": "^1.4.5-lts.1"  // 文件上传处理
}
```

---

## 🔧 配置变更

### 新增环境变量

需要在 `.env` 文件中添加：

```bash
# 腾讯云语音识别配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_APP_ID=your_app_id
TENCENT_REGION=ap-guangzhou
```

### 路由注册

在 `app.js` 中新增：

```javascript
var voiceRecognitionRouter = require('./routes/voice-recognition');
app.use('/api/voice-recognition', voiceRecognitionRouter);
```

---

## 📊 文件清单

### 新增文件

**后端核心**
- `utils/voiceRecognition.js` - 语音识别工具类
- `routes/voice-recognition.js` - 语音识别路由

**数据库**
- `scripts/init-voice-recognition-tables.sql` - 数据库表结构

**小程序示例**
- `miniapp-example/pages/voice-recognition/voice-recognition.js`
- `miniapp-example/pages/voice-recognition/voice-recognition.wxml`
- `miniapp-example/pages/voice-recognition/voice-recognition.wxss`
- `miniapp-example/pages/voice-recognition/voice-recognition.json`

**工具脚本**
- `scripts/setup-voice-recognition.js` - 安装配置脚本
- `test/voice-recognition-test.js` - 功能测试脚本

**文档**
- `docs/VOICE_RECOGNITION.md` - 完整文档
- `README_VOICE.md` - 快速开始
- `CHANGELOG_VOICE.md` - 更新日志
- `.env.example` - 环境变量模板（更新）

### 修改文件

- `app.js` - 注册语音识别路由
- `config/index.js` - 添加腾讯云配置
- `package.json` - 添加依赖和脚本命令

---

## 🚀 升级指南

### 对于现有项目

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置环境变量

编辑 `.env` 文件，添加腾讯云配置：

```bash
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_APP_ID=your_app_id
TENCENT_REGION=ap-guangzhou
```

获取密钥：https://console.cloud.tencent.com/cam/capi

#### 3. 初始化数据库

```bash
mysql -u root -p your_database < scripts/init-voice-recognition-tables.sql
```

#### 4. 运行配置检查

```bash
npm run setup-voice
```

#### 5. 运行测试

```bash
npm run test-voice
```

#### 6. 启动服务

```bash
npm start
```

---

## 🔍 测试验证

### API接口测试

#### 1. 健康检查

```bash
curl http://localhost/health
```

#### 2. 语音识别测试（需要token）

```bash
curl -X POST http://localhost/api/voice-recognition/realtime \
  -H "token: your_jwt_token" \
  -F "audio=@test.mp3"
```

#### 3. 统计信息

```bash
curl http://localhost/api/voice-recognition/stats \
  -H "token: your_jwt_token"
```

### 小程序端测试

1. 复制小程序示例代码到项目
2. 配置API地址
3. 测试录音和识别功能
4. 验证历史记录功能

---

## ⚠️ 注意事项

### 1. 成本控制

- 腾讯云提供**每月10小时免费额度**
- 超出部分按时长计费（约0.1元/分钟）
- 建议在开发环境充分测试后再上线
- 生产环境建议配置限流保护

### 2. 权限配置

小程序需要配置录音权限：

```json
{
  "permission": {
    "scope.record": {
      "desc": "需要使用您的录音权限进行语音识别"
    }
  }
}
```

### 3. 音频格式

推荐使用MP3格式：
- 文件较小
- 兼容性好
- 识别准确

### 4. 网络要求

- 需要稳定的网络连接
- 上传音频文件需要时间
- 建议显示上传进度

### 5. 数据安全

- 音频数据上传到腾讯云
- 识别记录保存在数据库
- 建议定期清理历史记录

---

## 🐛 已知问题

### 1. 微信小程序Silk格式

**问题**: 微信默认录音格式是silk，需要转换

**解决**: 
- 方案1：使用 `format: 'mp3'` 录音
- 方案2：使用专用接口 `/api/voice-recognition/wechat`

### 2. 长音频处理

**问题**: 长音频（>60秒）同步识别超时

**解决**: 使用异步接口 `/api/voice-recognition/long`

### 3. 网络超时

**问题**: 音频文件大或网络差时上传超时

**解决**: 
- 压缩音频文件
- 增加超时时间
- 添加重试机制

---

## 🔮 未来计划

### v1.1.0 (计划中)

- [ ] 实时流式识别
- [ ] 支持更多方言
- [ ] 语音降噪处理
- [ ] 多语种识别
- [ ] 识别结果校对

### v1.2.0 (计划中)

- [ ] 语音合成（TTS）
- [ ] 语音评测
- [ ] 关键词识别
- [ ] 声纹识别

---

## 📚 参考资源

### 官方文档

- [腾讯云语音识别](https://cloud.tencent.com/document/product/1093)
- [微信小程序录音API](https://developers.weixin.qq.com/miniprogram/dev/api/media/recorder/RecorderManager.html)

### 项目文档

- [完整文档](docs/VOICE_RECOGNITION.md)
- [快速开始](README_VOICE.md)
- [主项目README](README.md)

---

## 👥 贡献者

感谢所有为本项目做出贡献的开发者！

---

## 📝 许可证

本项目遵循原项目许可证。

---

**更新时间**: 2025-11-08  
**版本**: v1.0.0  
**状态**: 稳定版


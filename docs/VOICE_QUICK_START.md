# 🚀 语音识别系统 - 3分钟快速上手

## 📌 一句话介绍

**将语音实时转换为文字，一键应用到监理日志填写中。**

---

## ⚡ 快速开始（3步）

### 1️⃣ 安装依赖（30秒）

```bash
npm install
```

### 2️⃣ 配置密钥（1分钟）

编辑 `.env` 文件：

```bash
TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_APP_ID=1234567890
```

**获取密钥**: https://console.cloud.tencent.com/cam/capi

### 3️⃣ 初始化数据库（1分钟）

```bash
mysql -u root -p your_database < scripts/init-voice-recognition-tables.sql
```

**完成！启动服务：**

```bash
npm start
```

---

## 🎯 功能演示

### 小程序端使用

```
1. 打开语音识别页面
2. 按住"按住说话"按钮
3. 说话（例如："今天天气晴朗，施工进展顺利"）
4. 松开按钮
5. 等待2-3秒，识别结果自动显示
6. 点击"应用到监理日志"
```

### API调用示例

```bash
# 测试识别接口
curl -X POST http://localhost/api/voice-recognition/realtime \
  -H "token: your_jwt_token" \
  -F "audio=@test.mp3"

# 响应示例
{
  "code": 0,
  "message": "识别成功",
  "data": {
    "text": "今天天气晴朗，施工进展顺利",
    "audioTime": 3000
  }
}
```

---

## 📱 小程序集成（3步）

### 1. 复制文件

```bash
cp -r miniapp-example/pages/voice-recognition your-miniapp/pages/
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

### 3. 添加导航

```xml
<navigator url="/pages/voice-recognition/voice-recognition">
  <button>语音识别</button>
</navigator>
```

**完成！**

---

## 🔧 核心接口

### 实时识别

```javascript
// 小程序中调用
wx.uploadFile({
  url: `${apiUrl}/api/voice-recognition/realtime`,
  filePath: tempFilePath,
  name: 'audio',
  header: { 'token': token },
  success: (res) => {
    const data = JSON.parse(res.data)
    console.log('识别结果:', data.data.text)
  }
})
```

### 历史记录

```javascript
// 获取历史
wx.request({
  url: `${apiUrl}/api/voice-recognition/history`,
  method: 'GET',
  header: { 'token': token },
  success: (res) => {
    console.log('历史记录:', res.data.data.list)
  }
})
```

### 统计信息

```javascript
// 获取统计
wx.request({
  url: `${apiUrl}/api/voice-recognition/stats`,
  method: 'GET',
  header: { 'token': token },
  success: (res) => {
    console.log('统计:', res.data.data)
  }
})
```

---

## 💡 使用技巧

### 录音设置（推荐）

```javascript
recorderManager.start({
  duration: 60000,       // 60秒
  sampleRate: 16000,     // 16kHz（推荐）
  numberOfChannels: 1,   // 单声道
  format: 'mp3'          // MP3格式
})
```

### 识别参数（推荐）

```javascript
{
  engineType: '16k_zh',      // 16kHz中文
  filterDirty: '1',          // 过滤脏词
  convertNumMode: '1'        // 转换数字
}
```

---

## ⚠️ 注意事项

### 1. 权限配置

小程序 `app.json`：

```json
{
  "permission": {
    "scope.record": {
      "desc": "需要使用您的录音权限"
    }
  }
}
```

### 2. 音频格式

- ✅ 推荐：MP3
- ✅ 支持：WAV, M4A, AAC
- ⚠️ 文件大小：≤10MB

### 3. 成本控制

- 免费额度：每月10小时
- 超额费用：0.1元/分钟
- 建议监控用量

---

## 🐛 常见问题

### Q: 如何获取腾讯云密钥？

**A**: 访问 https://console.cloud.tencent.com/cam/capi

### Q: 识别不准确？

**A**: 
- 确保录音清晰
- 使用16kHz采样率
- 说话清晰、语速适中

### Q: 微信录音无法识别？

**A**: 使用 `format: 'mp3'` 而不是默认的silk

---

## 📚 完整文档

- 📖 [完整技术文档](VOICE_RECOGNITION.md)
- 🚀 [快速开始指南](../README_VOICE.md)
- 📝 [更新日志](../CHANGELOG_VOICE.md)
- 📋 [项目总结](VOICE_RECOGNITION_SUMMARY.md)

---

## 🎉 开始使用

```bash
# 1. 运行配置检查
npm run setup-voice

# 2. 运行功能测试
npm run test-voice

# 3. 启动服务
npm start

# 4. 测试接口
curl http://localhost/health
```

---

**🎊 祝使用愉快！**


# 微信一键登录测试说明

## 快速测试（推荐）

### 方法1：运行自动化测试脚本

```bash
# 1. 确保服务已启动
npm start

# 2. 在新终端运行测试
node test/test-wechat-login.js
```

这个脚本会自动测试以下场景：
- ✅ 测试登录接口
- ✅ 使用测试 code 登录
- ✅ Token 认证
- ✅ 无效 Token 认证
- ✅ 缺少必需参数
- ✅ 退出登录

### 方法2：使用 curl 手动测试

```bash
# 测试登录（需要先创建测试用户）
curl -X POST http://localhost/api/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{"openid":"test_openid_888888"}'

# 使用测试 code 登录（开发环境）
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_wechat_code_123456"}'

# 验证 token（替换 YOUR_TOKEN）
curl -X GET http://localhost/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 准备工作

### 创建测试用户（首次测试需要）

```sql
-- 在数据库中执行
INSERT INTO users (openid, nickname, avatar, organization) 
VALUES ('test_openid_888888', '测试用户', '', '测试组织');
```

### 确保环境配置正确

检查 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# 微信小程序配置
WECHAT_APPID=your_appid
WECHAT_APPSECRET=your_appsecret

# JWT 配置
JWT_SECRET=your-secret-key-at-least-32-characters-long

# 开发环境（支持测试 code）
NODE_ENV=development
```

## 测试结果示例

### 成功的测试输出

```
╔═══════════════════════════════════════════════════════════╗
║         微信一键登录功能测试                               ║
╚═══════════════════════════════════════════════════════════╝

🧪 测试1: 测试登录接口
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 测试通过
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI...
   用户ID: 1
   昵称: 测试用户
   是否新用户: false

🧪 测试2: 使用测试 code 登录
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 测试通过
   消息: 登录成功（测试模式）
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI...
   用户ID: 10

🧪 测试3: Token 认证
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 测试通过
   用户ID: 1
   昵称: 测试用户
   组织: 测试组织

🧪 测试4: 无效 Token 认证
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 测试通过（正确返回 401 未授权）
   消息: Token验证失败

🧪 测试5: 缺少必需参数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 测试通过（正确返回 400 参数错误）
   消息: 缺少登录code

🧪 测试6: 退出登录
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 测试通过
   消息: 退出成功

╔═══════════════════════════════════════════════════════════╗
║         测试完成                                          ║
╚═══════════════════════════════════════════════════════════╝
```

## 在小程序中测试

### 1. 配置请求地址

```javascript
// miniapp/utils/request.js
const BASE_URL = 'http://localhost'  // 开发环境
// const BASE_URL = 'https://your-domain.com'  // 生产环境
```

### 2. 调用登录

```javascript
// 在页面或 app.js 中
async function login() {
  try {
    // 1. 获取 code
    const { code } = await wx.login()
    
    // 2. 发送到后端
    const res = await wx.request({
      url: 'http://localhost/api/auth/login',
      method: 'POST',
      data: { code }
    })
    
    // 3. 保存 token
    if (res.data.code === 0) {
      wx.setStorageSync('token', res.data.data.token)
      console.log('登录成功', res.data.data)
    }
  } catch (error) {
    console.error('登录失败', error)
  }
}
```

### 3. 在微信开发者工具中查看

1. 打开微信开发者工具
2. 在控制台查看日志
3. 在 Storage 中查看是否保存了 token

## 常见问题

### 问题1：提示"用户不存在"

**原因：** 数据库中没有测试用户

**解决：** 执行上面的 SQL 创建测试用户

### 问题2：提示"数据库连接失败"

**原因：** 数据库配置错误或数据库未启动

**解决：** 
1. 检查 `.env` 中的数据库配置
2. 确保数据库服务正在运行
3. 运行 `node scripts/test-db-connection.js` 测试连接

### 问题3：测试 code 不生效

**原因：** NODE_ENV 未设置为 development

**解决：** 在 `.env` 中添加：

```env
NODE_ENV=development
```

### 问题4：Token 无法验证

**原因：** JWT_SECRET 配置问题

**解决：** 确保 `.env` 中有正确的 JWT_SECRET 配置

## 完整文档

查看完整的测试指南：[docs/微信一键登录测试指南.md](../docs/微信一键登录测试指南.md)

包含：
- 详细的测试方法
- 小程序完整示例代码
- 各种测试场景
- 问题排查指南
- 验证清单

## 相关文件

- `routes/auth.js` - 登录接口实现
- `middleware/auth.js` - 认证中间件
- `utils/wechat.js` - 微信 API 封装
- `utils/jwt.js` - JWT 工具函数
- `miniapp-example/login-example.js` - 小程序登录示例
- `test/api-test/tests/auth.test.js` - 自动化测试


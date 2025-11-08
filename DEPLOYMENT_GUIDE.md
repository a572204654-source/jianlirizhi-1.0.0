# 云托管部署指南

## 环境变量配置

### 必需的环境变量

在云托管控制台配置以下环境变量：

#### 1. 和风天气配置

```bash
QWEATHER_KEY_ID=你的凭据ID
QWEATHER_PROJECT_ID=你的项目ID
QWEATHER_PRIVATE_KEY=私钥内容
```

**获取方式**：
1. 登录 [和风天气控制台](https://console.qweather.com/)
2. 进入"项目管理" → 选择你的项目
3. 在"凭据管理"中找到凭据ID和项目ID
4. 下载或复制私钥文件内容

**私钥格式**：
- 完整的PEM格式（包括 BEGIN 和 END 行）
- 如果云托管界面不支持多行，可以用 `<br>` 替换换行符
- 示例：`-----BEGIN PRIVATE KEY-----<br>MC4CAQAwBQYDK2VwBCIEI...<br>-----END PRIVATE KEY-----`

#### 2. 数据库配置（如果需要）

```bash
DB_HOST=数据库地址
DB_PORT=3306
DB_USER=数据库用户名
DB_PASSWORD=数据库密码
DB_NAME=数据库名称
```

#### 3. 其他配置

```bash
NODE_ENV=production
JWT_SECRET=你的JWT密钥
```

## 部署步骤

### 方式1：使用 CloudBase CLI（推荐）

```bash
# 1. 登录
cloudbase login

# 2. 部署
cloudbase framework deploy
```

### 方式2：手动构建和推送

```bash
# 1. 构建 Docker 镜像
docker build -t supervision-log-api .

# 2. 推送到云托管
# （需要先配置镜像仓库）
```

## 验证部署

部署完成后，访问以下接口验证：

```bash
# 健康检查
curl https://api.yimengpl.com/health

# 测试天气API
curl "https://api.yimengpl.com/api/weather/now?location=101010100"
```

## 常见问题

### 1. 403 错误

**原因**：和风天气API认证失败

**解决**：
1. 检查环境变量是否正确配置
2. 确认私钥格式正确（包含完整的 BEGIN 和 END 行）
3. 检查凭据ID和项目ID是否匹配
4. 查看云托管日志确认环境变量是否生效

### 2. 数据库连接失败

**原因**：数据库配置错误或网络不通

**解决**：
1. 云托管使用数据库内网地址
2. 确认数据库用户名和密码正确
3. 检查数据库是否允许云托管网络访问

### 3. 服务无法访问

**原因**：服务未正常启动或域名配置错误

**解决**：
1. 查看云托管日志确认服务启动状态
2. 检查自定义域名配置
3. 确认端口映射正确（容器端口80）

## 查看日志

在云托管控制台：
1. 进入服务详情
2. 点击"日志"标签
3. 查看实时日志或历史日志

关键日志：
- `数据库连接成功` - 数据库连接正常
- `使用环境变量中的私钥生成JWT token` - 私钥配置正常
- `Server is running on port 80` - 服务启动成功

## 更新部署

修改代码后重新部署：

```bash
# 提交代码
git add .
git commit -m "更新: 描述你的改动"

# 重新部署
cloudbase framework deploy
```

## 回滚

如果新版本有问题，可以在云托管控制台回滚到之前的版本：

1. 进入服务详情
2. 点击"版本管理"
3. 选择稳定的历史版本
4. 点击"切换到此版本"


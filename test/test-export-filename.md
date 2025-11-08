# 监理日志导出文件命名测试

## 修改说明

监理日志导出Word文档的命名已修改为：**单位工程名称 + 时间**

### 修改前
```
监理日志_2025-11-08.docx
```

### 修改后
```
桥梁工程_2025-11-08.docx
道路施工_2025-11-08.docx
地基处理_2025-11-08.docx
```

## 命名规则

### 文件名格式
```
{单位工程名称}_{日期}.docx
```

### 字段来源
1. **单位工程名称** - 优先级顺序：
   - `unit_work` - 单位工程字段（最优先）
   - `work_name` - 工程名称（备选）
   - `"监理日志"` - 默认值（兜底）

2. **日期格式** - `YYYY-MM-DD`
   - 使用日志的 `log_date` 字段
   - 如果为空则使用当前日期

### 示例

#### 示例1：有单位工程名称
```javascript
// 数据库数据
{
  unit_work: "桥梁主体结构工程",
  work_name: "跨江大桥工程",
  log_date: "2025-11-08"
}

// 导出文件名
桥梁主体结构工程_2025-11-08.docx
```

#### 示例2：没有单位工程名称
```javascript
// 数据库数据
{
  unit_work: null,
  work_name: "道路施工项目",
  log_date: "2025-11-08"
}

// 导出文件名
道路施工项目_2025-11-08.docx
```

#### 示例3：都为空的情况
```javascript
// 数据库数据
{
  unit_work: null,
  work_name: null,
  log_date: "2025-11-08"
}

// 导出文件名
监理日志_2025-11-08.docx
```

## 代码实现

### 修改位置
文件：`routes/supervision-log.js` 第536-538行

### 修改代码
```javascript
// 使用单位工程名称+时间作为文件名
const workName = logData.unit_work || logData.work_name || '监理日志'
const fileName = `${workName}_${dateStr}.docx`
```

### 逻辑说明
1. 首先尝试使用 `unit_work`（单位工程）
2. 如果没有，使用 `work_name`（工程名称）
3. 如果都没有，使用 `"监理日志"` 作为默认名称
4. 拼接日期（YYYY-MM-DD格式）
5. 添加 `.docx` 扩展名

## 测试方法

### 1. 准备测试数据

确保数据库中的 `works` 表有 `unit_work` 字段：

```sql
-- 查看工程表结构
DESC works;

-- 确认有单位工程字段
-- unit_work varchar(255) DEFAULT NULL
```

### 2. 创建测试数据

```sql
-- 插入测试工程
INSERT INTO works (project_id, work_name, unit_work) VALUES
(1, '跨江大桥工程', '桥梁主体结构工程'),
(1, '道路施工项目', '路基土方工程'),
(1, '地下隧道工程', NULL);

-- 创建测试监理日志
INSERT INTO supervision_logs 
(project_id, work_id, user_id, log_date, weather, project_dynamics, supervision_work, safety_work) 
VALUES
(1, 1, 1, '2025-11-08', '晴', '桥梁施工进度正常', '现场巡检', '安全检查');
```

### 3. 测试导出接口

#### 方法1：通过小程序
```javascript
// 在小程序中调用导出接口
wx.request({
  url: 'https://your-api.com/api/supervision-logs/1/export',
  header: {
    'token': 'your-jwt-token'
  },
  success: (res) => {
    // 检查返回的文件名
    const contentDisposition = res.header['content-disposition']
    console.log('文件名:', contentDisposition)
    // 期望输出: attachment; filename="桥梁主体结构工程_2025-11-08.docx"
  }
})
```

#### 方法2：通过Postman/Apifox
```
GET http://localhost/api/supervision-logs/1/export
Headers:
  token: your-jwt-token

检查响应头:
Content-Disposition: attachment; filename="桥梁主体结构工程_2025-11-08.docx"
```

#### 方法3：通过curl命令
```bash
curl -H "token: your-jwt-token" \
     -o test.docx \
     -v \
     http://localhost/api/supervision-logs/1/export

# 检查响应头中的文件名
```

### 4. 验证检查点

✅ **必须验证的项目**：

1. **文件名包含单位工程名称**
   - 如果有 `unit_work` 字段，文件名应该使用它
   - 如果没有，应该使用 `work_name`

2. **文件名包含日期**
   - 格式为 `YYYY-MM-DD`
   - 使用日志的实际日期

3. **中文文件名正确编码**
   - 响应头使用 `encodeURIComponent()` 编码
   - 浏览器能正确显示中文文件名

4. **文件可以正常下载**
   - 文件类型正确（.docx）
   - 文件可以用Word打开

5. **特殊情况处理**
   - 单位工程名称为空时的降级处理
   - 工程名称也为空时使用默认名称

## 小程序端完整示例

### 下载并保存文件
```javascript
// pages/supervision-log/detail.js

exportLog() {
  const logId = this.data.logId
  
  wx.showLoading({
    title: '导出中...'
  })
  
  wx.request({
    url: `${app.globalData.apiUrl}/api/supervision-logs/${logId}/export`,
    header: {
      'token': wx.getStorageSync('token')
    },
    responseType: 'arraybuffer', // 重要：指定返回二进制数据
    success: (res) => {
      if (res.statusCode === 200) {
        // 获取文件名（从响应头）
        const contentDisposition = res.header['content-disposition'] || ''
        let fileName = '监理日志.docx'
        
        // 解析文件名
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1])
        }
        
        // 将ArrayBuffer转为Base64
        const base64 = wx.arrayBufferToBase64(res.data)
        
        // 保存到临时文件
        const fs = wx.getFileSystemManager()
        const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
        
        fs.writeFile({
          filePath: filePath,
          data: base64,
          encoding: 'base64',
          success: () => {
            wx.hideLoading()
            wx.showToast({
              title: '导出成功',
              icon: 'success'
            })
            
            // 打开文件
            wx.openDocument({
              filePath: filePath,
              fileType: 'docx',
              success: () => {
                console.log('打开文档成功')
              }
            })
          },
          fail: (err) => {
            wx.hideLoading()
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
            console.error('保存文件失败:', err)
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    },
    fail: (err) => {
      wx.hideLoading()
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      })
      console.error('导出失败:', err)
    }
  })
}
```

## 可能遇到的问题

### 问题1：中文文件名乱码
**原因**: 没有正确编码中文字符

**解决**: 代码中已使用 `encodeURIComponent(fileName)` 进行编码

### 问题2：文件名显示为"监理日志"
**原因**: 数据库中 `unit_work` 和 `work_name` 都为空

**解决**: 
1. 在创建工程时填写单位工程名称
2. 或者至少填写工程名称

### 问题3：日期格式不正确
**原因**: 日志日期字段为空或格式错误

**解决**: 确保创建日志时填写了正确的日期

### 问题4：小程序无法打开文件
**原因**: 文件保存路径或格式问题

**解决**: 
1. 使用 `wx.env.USER_DATA_PATH` 作为保存路径
2. 确保 `responseType: 'arraybuffer'`
3. 正确转换为Base64格式

## 总结

✅ **已完成**：
- 修改导出文件名逻辑
- 使用单位工程名称+日期格式
- 添加降级处理机制
- 代码无语法错误

📝 **文件名格式**：
```
{单位工程名称}_{YYYY-MM-DD}.docx
```

🎯 **示例**：
- `桥梁主体结构工程_2025-11-08.docx`
- `路基土方工程_2025-11-08.docx`
- `地下隧道工程_2025-11-08.docx`

---

**修改时间**: 2025-11-08  
**修改文件**: `routes/supervision-log.js`  
**修改行数**: 536-538行


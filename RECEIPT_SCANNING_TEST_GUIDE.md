# 收据扫描功能测试指南

## 功能概述

Home页面现在支持扫描收据图片并自动识别食材功能。用户可以通过以下方式上传收据图片：
1. 点击"Scan Receipt"按钮拍照
2. 点击"Scan Fridge"按钮拍照
3. 拖拽图片到"Drop Files Here"区域
4. 点击"Browse Files"按钮选择图片

## 接口信息

### 1. 收据识别接口（新 - 用于Analyze Files按钮）
- **接口地址**: `POST https://pbl.florentin.online/api/inventory/detect`
- **API文档**: `https://pbl.florentin.online/swagger-ui/index.html#/detect-food-controller`
- **请求格式**: multipart/form-data
- **必填参数**: 
  - `image`: 上传的收据图片文件（类型为二进制文件）
- **成功响应** (200 OK):
  ```json
  {
    "detectedItems": [
      {
        "id": 1,
        "name": "Tomatoes"
      },
      {
        "id": 2,
        "name": "Chicken Breast"
      }
    ]
  }
  ```

### 2. 库存新增接口
- **接口地址**: `POST https://foodflow-pblclass.onrender.com/api/inventory`
- **请求格式**: application/json
- **请求头**: 
  - `Content-Type: application/json`
  - `X-User-Id: {用户ID}`
- **请求体**:
  ```json
  {
    "name": "Tomatoes",
    "category": "Vegetables"
  }
  ```

## 测试步骤

### 前置条件
1. 确保用户已登录（localStorage中有user对象）
2. 确保新detect API服务正常运行（https://pbl.florentin.online）
3. 确保前端开发服务器正在运行

### 测试场景1: 上传JPG图片识别食材

#### 步骤:
1. 打开浏览器访问 http://localhost:5173
2. 登录应用
3. 导航到Home页面
4. 准备一张JPG格式的收据图片
5. 拖拽图片到"Drop Files Here"区域
6. 点击"Analyze Files"按钮

#### 预期结果:
- ✅ 图片成功上传
- ✅ 显示"Analyzing files..."提示
- ✅ 调用新detect API: `POST https://pbl.florentin.online/api/inventory/detect`
- ✅ 识别结果展示在"Detected Ingredients"表格中
- ✅ 每个食材显示名称和状态（Matched）
- ✅ 显示成功提示："Successfully detected X ingredients"

#### 控制台日志:
```
uploadReceiptImageNew - userId: 1
uploadReceiptImageNew - file: receipt.jpg image/jpeg
uploadReceiptImageNew - Adding X-User-Id header: 1
uploadReceiptImageNew - sending request to: https://pbl.florentin.online/api/inventory/detect
uploadReceiptImageNew - response status: 200
uploadReceiptImageNew - response ok: true
Detected ingredients response: {detectedItems: [...]}
```

---

### 测试场景2: 上传PNG图片识别食材

#### 步骤:
1. 准备一张PNG格式的收据图片
2. 点击"Browse Files"按钮
3. 选择PNG图片
4. 点击"Analyze Files"按钮

#### 预期结果:
- ✅ PNG图片成功上传
- ✅ 识别结果正常展示
- ✅ 与JPG图片行为一致

---

### 测试场景3: 上传不支持的文件格式

#### 步骤:
1. 准备一个PDF文件或其他非图片文件
2. 拖拽文件到"Drop Files Here"区域

#### 预期结果:
- ❌ 文件被拒绝
- ❌ 显示错误提示："仅支持 JPG/PNG 格式图片"
- ❌ 文件不会添加到"Selected Files"列表

#### Toast提示:
```
仅支持 JPG/PNG 格式图片
```

---

### 测试场景4: 批量添加识别的食材到库存

#### 步骤:
1. 上传收据图片并成功识别食材
2. 检查"Detected Ingredients"表格中的食材列表
3. 点击"Confirm & Add to Inventory"按钮

#### 预期结果:
- ✅ 显示"Adding to inventory..."提示
- ✅ 循环调用库存新增接口：`POST https://foodflow-pblclass.onrender.com/api/inventory`
- ✅ 每个食材都携带当前用户的X-User-Id header
- ✅ 显示成功提示："Successfully added X items to inventory"
- ✅ 自动跳转到Inventory页面
- ✅ Inventory页面显示新添加的食材

#### 控制台日志:
```
fetchAPI - endpoint: /inventory
fetchAPI - user: {id: 1, username: "testuser", email: "test@example.com"}
fetchAPI - userId: 1
fetchAPI - Adding X-User-Id header: 1
fetchAPI - headers: {Content-Type: "application/json", X-User-Id: "1"}
fetchAPI - response status: 200
fetchAPI - response ok: true
```

---

### 测试场景5: 网络错误处理

#### 步骤:
1. 断开网络连接或停止detect API服务
2. 上传收据图片
3. 点击"Analyze Files"按钮

#### 预期结果:
- ❌ 显示错误提示："网络异常，请检查连接"
- ❌ 不显示识别结果
- ❌ 显示"Error analyzing files. Please try again."

#### Toast提示:
```
网络异常，请检查连接
```

---

### 测试场景6: API返回400错误

#### 步骤:
1. 上传无效的收据图片（如空白图片或损坏的图片）
2. 点击"Analyze Files"按钮

#### 预期结果:
- ❌ 显示错误提示："图片识别失败，请重试"
- ❌ 不显示识别结果

#### Toast提示:
```
图片识别失败，请重试
```

---

### 测试场景7: 编辑和删除识别的食材

#### 步骤:
1. 上传收据图片并成功识别食材
2. 在"Detected Ingredients"表格中：
   - 点击某个食材的"Edit"按钮
   - 修改食材名称
   - 点击"Confirm"按钮确认修改
   - 点击某个食材的"X"按钮删除该食材

#### 预期结果:
- ✅ 食材名称可以编辑
- ✅ 食材可以删除
- ✅ 删除的食材不会添加到库存

---

### 测试场景8: 手动添加食材

#### 步骤:
1. 在"Add Ingredients Manually"区域
2. 在搜索框中输入食材名称（如"Tomatoes"）
3. 从下拉列表中选择食材
4. 点击"Confirm & Add to Inventory"按钮

#### 预期结果:
- ✅ 手动添加的食材显示在"Selected Ingredients"列表中
- ✅ 手动添加的食材和识别的食材一起批量添加到库存
- ✅ 添加成功后跳转到Inventory页面

---

## API调用示例

### 使用Curl测试detect接口

#### 测试1: 上传收据图片
```bash
curl -X POST https://pbl.florentin.online/api/inventory/detect \
  -H "X-User-Id: 1" \
  -F "image=@/path/to/receipt.jpg"
```

#### 预期响应:
```json
{
  "detectedItems": [
    {
      "id": 1,
      "name": "Tomatoes"
    },
    {
      "id": 2,
      "name": "Chicken Breast"
    }
  ]
}
```

---

### 使用Postman测试detect接口

#### 请求配置:
```
Method: POST
URL: https://pbl.florentin.online/api/inventory/detect
Headers:
  X-User-Id: 1
Body (form-data):
  image: [选择收据图片文件]
```

#### 预期响应:
```json
{
  "detectedItems": [
    {
      "id": 1,
      "name": "Tomatoes"
    }
  ]
}
```

---

## 文件类型验证

### 支持的文件类型:
- ✅ image/jpeg (JPG)
- ✅ image/png (PNG)

### 不支持的文件类型:
- ❌ application/pdf (PDF)
- ❌ image/gif (GIF)
- ❌ image/webp (WebP)
- ❌ 其他文件类型

### 文件大小限制:
- 最大文件大小: 10MB

---

## 错误处理

### 错误场景和提示:

| 错误场景 | 错误提示 |
|---------|---------|
| 文件类型不支持 | "仅支持 JPG/PNG 格式图片" |
| API返回400错误 | "图片识别失败，请重试" |
| 网络错误 | "网络异常，请检查连接" |
| 其他错误 | "图片识别失败，请重试" |

---

## 数据隔离

### 用户ID传递:
- 所有API调用都自动添加`X-User-Id` header
- 用户ID从localStorage中的user对象获取
- 确保每个用户只能看到和操作自己的数据

### 库存数据隔离:
- 识别的食材添加到库存时携带用户ID
- 库存查询时只返回当前用户的食材
- 确保用户数据安全和隔离

---

## 验证清单

### 功能验证:
- [x] 文件上传功能正常
- [x] 文件类型验证正常
- [x] 收据识别接口调用正常
- [x] 识别结果展示正常
- [x] 批量添加到库存功能正常
- [x] 手动添加食材功能正常
- [x] 编辑和删除食材功能正常
- [x] 错误处理和提示正常

### 数据验证:
- [x] 用户ID正确传递到后端
- [x] 库存数据按用户隔离
- [x] 识别结果正确解析
- [x] 批量添加成功

### 用户体验验证:
- [x] 加载状态提示清晰
- [x] 错误提示友好
- [x] 成功提示明确
- [x] 页面跳转流畅

---

## 常见问题

### Q1: 为什么上传图片后没有识别结果？
A: 请检查：
1. 图片格式是否为JPG或PNG
2. 图片大小是否超过10MB
3. detect API服务是否正常运行
4. 网络连接是否正常

### Q2: 如何确认detect API是否正常工作？
A: 使用Curl或Postman测试接口：
```bash
curl -X POST https://pbl.florentin.online/api/inventory/detect \
  -H "X-User-Id: 1" \
  -F "image=@/path/to/receipt.jpg"
```

### Q3: 识别的食材可以编辑吗？
A: 可以。在"Detected Ingredients"表格中点击"Edit"按钮即可编辑食材名称。

### Q4: 可以删除识别的食材吗？
A: 可以。在"Detected Ingredients"表格中点击"X"按钮即可删除该食材。

### Q5: 手动添加的食材和识别的食材可以一起添加到库存吗？
A: 可以。点击"Confirm & Add to Inventory"按钮时，会将识别的食材和手动添加的食材一起批量添加到库存。

---

## 总结

收据扫描功能已成功实现，包括：
- ✅ 文件上传和拖拽功能
- ✅ 文件类型验证（JPG/PNG）
- ✅ 新收据识别接口集成（https://pbl.florentin.online）
- ✅ 识别结果展示
- ✅ 批量添加到库存（使用原有库存API）
- ✅ 错误处理和友好提示
- ✅ 用户数据隔离

**重要说明**：
- "Analyze Files"按钮现在使用新的HTTPS接口：`https://pbl.florentin.online/api/inventory/detect`
- 其他所有API调用（新增库存、查询库存等）继续使用原有接口地址和逻辑
- 确保接口调用隔离，互不影响

用户现在可以通过上传收据图片快速识别食材，并批量添加到库存中，大大提升了用户体验。

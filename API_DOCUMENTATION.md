# FoodFlow API 接口文档

## 目录

1. [概述](#概述)
2. [基础信息](#基础信息)
3. [用户相关接口](#用户相关接口)
4. [库存相关接口](#库存相关接口)
5. [食谱相关接口](#食谱相关接口)
6. [餐食计划相关接口](#餐食计划相关接口)
7. [收据识别接口](#收据识别接口)
8. [错误处理](#错误处理)
9. [数据隔离](#数据隔离)

---

## 概述

FoodFlow API 是一个基于 RESTful 架构的后端服务，提供用户管理、库存管理、食谱管理、餐食计划管理等功能。所有接口均支持数据隔离，确保每个用户只能访问自己的数据。

### 技术栈

- **后端框架**: Spring Boot
- **数据库**: PostgreSQL
- **API协议**: HTTP/HTTPS
- **数据格式**: JSON
- **认证方式**: Header-based (X-User-Id)

---

## 基础信息

### API Base URL

#### 生产环境
```
https://foodflow-pblclass.onrender.com/api
```

#### 本地开发环境
```
http://localhost:8080/api
```

#### 收据识别API
```
https://163.221.152.191:8080/api/inventory/detect
```

### 通用请求头

| Header名称 | 类型 | 必填 | 说明 |
|-----------|------|--------|------|
| Content-Type | String | 是 | application/json 或 multipart/form-data |
| X-User-Id | Long | 是 | 当前登录用户的ID |

### 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "code": 400
}
```

---

## 用户相关接口

### 1. 用户注册

**接口地址**: `POST /users/register`

**请求参数**:
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

**请求头**:
- Content-Type: application/json

**成功响应** (200 OK):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-02-23T12:00:00"
  }
}
```

**错误响应** (400 Bad Request):
```json
{
  "success": false,
  "message": "Username already exists"
}
```

**错误场景**:
- Username is required: 用户名为空
- Password is required: 密码为空
- Username already exists: 用户名已存在
- Registration failed: 注册失败

---

### 2. 用户登录

**接口地址**: `POST /users/login`

**请求参数**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**请求头**:
- Content-Type: application/json

**成功响应** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-02-23T12:00:00"
  }
}
```

**错误响应** (400 Bad Request):
```json
{
  "success": false,
  "message": "User not found"
}
```

或
```json
{
  "success": false,
  "message": "Invalid password"
}
```

**错误场景**:
- User not found: 用户不存在
- Invalid password: 密码错误

---

### 3. 获取所有用户

**接口地址**: `GET /users`

**请求头**:
- 无特殊要求

**成功响应** (200 OK):
```json
[
  {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-02-23T12:00:00"
  },
  {
    "id": 2,
    "username": "user2",
    "email": "user2@example.com",
    "createdAt": "2026-02-23T12:00:00"
  }
]
```

---

### 4. 获取用户详情

**接口地址**: `GET /users/{id}`

**路径参数**:
- id: 用户ID

**成功响应** (200 OK):
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "createdAt": "2026-02-23T12:00:00"
}
```

**错误响应** (404 Not Found):
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 库存相关接口

### 1. 添加食材到库存

**接口地址**: `POST /inventory`

**请求参数**:
```json
{
  "name": "Tomatoes",
  "category": "Vegetables",
  "description": "Fresh tomatoes"
}
```

**请求头**:
- Content-Type: application/json
- X-User-Id: 1 (必填)

**成功响应** (200 OK):
```json
{
  "id": 123,
  "ingredient": {
    "id": 456,
    "name": "Tomatoes",
    "category": "Vegetables",
    "description": "Fresh tomatoes"
  },
  "userId": 1,
  "lastUpdated": "2026-02-23T14:30:00",
  "createdAt": "2026-02-23T14:30:00"
}
```

**错误响应** (400 Bad Request):
```json
{
  "error": "X-User-Id header is required",
  "code": 400
}
```

或
```json
{
  "error": "Ingredient name is required",
  "code": 400
}
```

**错误响应** (500 Internal Server Error):
```json
{
  "error": "Failed to add to inventory: ...",
  "code": 500
}
```

**错误场景**:
- X-User-Id header is required: 未提供用户ID
- Ingredient name is required: 食材名称为空
- Failed to add to inventory: 添加失败（数据库错误等）

---

### 2. 获取库存列表

**接口地址**: `GET /inventory`

**请求头**:
- X-User-Id: 1 (必填)

**成功响应** (200 OK):
```json
[
  {
    "id": 123,
    "name": "Tomatoes",
    "category": "Vegetables",
    "lastUpdated": "2026-02-23 14:30:00"
  },
  {
    "id": 124,
    "name": "Chicken Breast",
    "category": "Meat",
    "lastUpdated": "2026-02-23 15:00:00"
  }
]
```

**错误响应** (400 Bad Request):
```json
{
  "error": "X-User-Id header is required",
  "code": 400
}
```

**错误响应** (500 Internal Server Error):
```json
{
  "error": "Failed to get inventory: ...",
  "code": 500
}
```

**说明**:
- 只返回当前用户的库存数据
- 按ID升序排列
- lastUpdated格式为东京时间：yyyy-MM-dd HH:mm:ss

---

### 3. 更新库存项

**接口地址**: `PUT /inventory/{id}`

**路径参数**:
- id: 库存项ID

**请求参数**:
```json
{
  // 当前为空，保留用于未来扩展
}
```

**请求头**:
- Content-Type: application/json
- X-User-Id: 1 (必填)

**成功响应** (200 OK):
```json
{
  "id": 123,
  "ingredient": {
    "id": 456,
    "name": "Tomatoes",
    "category": "Vegetables"
  },
  "userId": 1,
  "lastUpdated": "2026-02-23T16:00:00",
  "createdAt": "2026-02-23T14:30:00"
}
```

**错误响应** (400 Bad Request):
```json
{
  "error": "X-User-Id header is required",
  "code": 400
}
```

**错误响应** (404 Not Found):
```json
{
  "error": "Inventory not found",
  "code": 404
}
```

**错误响应** (500 Internal Server Error):
```json
{
  "error": "Failed to update inventory: ...",
  "code": 500
}
```

**说明**:
- 只能更新当前用户的库存项
- 自动更新lastUpdated时间

---

### 4. 删除库存项

**接口地址**: `DELETE /inventory/{id}`

**路径参数**:
- id: 库存项ID

**请求头**:
- X-User-Id: 1 (必填)

**成功响应** (204 No Content):
- 无响应体

**错误响应** (400 Bad Request):
```json
{
  "error": "X-User-Id header is required",
  "code": 400
}
```

**错误响应** (500 Internal Server Error):
```json
{
  "error": "Failed to delete inventory: ...",
  "code": 500
}
```

**说明**:
- 只能删除当前用户的库存项
- 如果库存项不存在，也返回204（幂等操作）

---

## 食谱相关接口

### 1. 获取所有食谱

**接口地址**: `GET /recipes`

**请求头**:
- X-User-Id: 1 (必填)

**成功响应** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Tomato Soup",
    "status": "draft",
    "prepTime": 15,
    "cookTime": 30,
    "servings": 4,
    "instructions": "Step 1: ...",
    "userId": 1,
    "isPublic": false,
    "createdAt": "2026-02-23T12:00:00",
    "updatedAt": "2026-02-23T12:00:00",
    "ingredients": [
      {
        "id": 1,
        "name": "Tomatoes",
        "category": "Vegetables"
      }
    ]
  }
]
```

**错误响应** (400 Bad Request):
- 无响应体

**说明**:
- 只返回当前用户的食谱
- 按ID升序排列

---

### 2. 获取公开食谱

**接口地址**: `GET /recipes/public`

**请求头**:
- 无特殊要求

**成功响应** (200 OK):
```json
[
  {
    "id": 2,
    "name": "Chicken Curry",
    "status": "published",
    "prepTime": 20,
    "cookTime": 45,
    "servings": 6,
    "instructions": "Step 1: ...",
    "userId": 2,
    "isPublic": true,
    "createdAt": "2026-02-23T12:00:00",
    "updatedAt": "2026-02-23T12:00:00",
    "ingredients": [
      {
        "id": 2,
        "name": "Chicken",
        "category": "Meat"
      }
    ]
  }
]
```

**说明**:
- 返回所有用户的公开食谱
- 按ID升序排列

---

### 3. 按状态获取食谱

**接口地址**: `GET /recipes/status/{status}`

**路径参数**:
- status: 食谱状态 (draft, published, etc.)

**请求头**:
- X-User-Id: 1 (必填)

**成功响应** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Tomato Soup",
    "status": "draft",
    "userId": 1,
    "isPublic": false
  }
]
```

**错误响应** (400 Bad Request):
- 无响应体

**说明**:
- 只返回当前用户的食谱
- 按状态过滤

---

### 4. 创建食谱

**接口地址**: `POST /recipes`

**请求参数**:
```json
{
  "name": "Tomato Soup",
  "status": "draft",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "instructions": "Step 1: ...",
  "isPublic": false,
  "ingredients": [
    {
      "id": 1,
      "name": "Tomatoes",
      "category": "Vegetables"
    }
  ]
}
```

**请求头**:
- Content-Type: application/json
- X-User-Id: 1 (必填)

**成功响应** (200 OK):
```json
{
  "id": 1,
  "name": "Tomato Soup",
  "status": "draft",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "instructions": "Step 1: ...",
  "userId": 1,
  "isPublic": false,
  "createdAt": "2026-02-23T12:00:00",
  "updatedAt": "2026-02-23T12:00:00",
  "ingredients": [
    {
      "id": 1,
      "name": "Tomatoes",
      "category": "Vegetables"
    }
  ]
}
```

**错误响应** (400 Bad Request):
- 无响应体

**说明**:
- 自动设置userId为当前用户
- 如果isPublic为null，默认为false
- 自动处理ingredients（创建或关联已有食材）

---

### 5. 更新食谱

**接口地址**: `PUT /recipes/{id}`

**路径参数**:
- id: 食谱ID

**请求参数**:
```json
{
  "name": "Tomato Soup Updated",
  "status": "published",
  "prepTime": 20,
  "cookTime": 35,
  "servings": 5,
  "instructions": "Step 1: ...",
  "isPublic": true,
  "ingredients": [
    {
      "id": 1,
      "name": "Tomatoes",
      "category": "Vegetables"
    }
  ]
}
```

**请求头**:
- Content-Type: application/json
- X-User-Id: 1 (必填)

**成功响应** (200 OK):
```json
{
  "id": 1,
  "name": "Tomato Soup Updated",
  "status": "published",
  "prepTime": 20,
  "cookTime": 35,
  "servings": 5,
  "instructions": "Step 1: ...",
  "userId": 1,
  "isPublic": true,
  "createdAt": "2026-02-23T12:00:00",
  "updatedAt": "2026-02-23T13:00:00",
  "ingredients": [...]
}
```

**错误响应** (404 Not Found):
- 无响应体

**说明**:
- 只能更新当前用户的食谱
- 自动更新updatedAt时间

---

### 6. 删除食谱

**接口地址**: `DELETE /recipes/{id}`

**路径参数**:
- id: 食谱ID

**请求头**:
- X-User-Id: 1 (必填)

**成功响应** (204 No Content):
- 无响应体

**错误响应** (400 Bad Request):
- 无响应体

**说明**:
- 只能删除当前用户的食谱

---

### 7. 生成随机食谱

**接口地址**: `POST /recipes/generate`

**查询参数**:
- count: 生成的食谱数量（默认10）

**成功响应** (200 OK):
```json
"Generated 10 random recipes"
```

**说明**:
- 用于测试和开发
- 生成随机食谱数据

---

## 餐食计划相关接口

### 1. 获取所有餐食计划

**接口地址**: `GET /meal-plans`

**请求头**:
- 无特殊要求

**成功响应** (200 OK):
```json
[
  {
    "id": 1,
    "date": "2026-02-23",
    "recipe": {
      "id": 1,
      "name": "Tomato Soup"
    }
  }
]
```

---

### 2. 按周获取餐食计划

**接口地址**: `GET /meal-plans/week`

**查询参数**:
- startDate: 开始日期 (yyyy-MM-dd)
- endDate: 结束日期 (yyyy-MM-dd)

**成功响应** (200 OK):
```json
[
  {
    "id": 1,
    "date": "2026-02-23",
    "recipe": {
      "id": 1,
      "name": "Tomato Soup"
    }
  }
]
```

---

### 3. 按日期获取餐食计划

**接口地址**: `GET /meal-plans/date/{date}`

**路径参数**:
- date: 日期 (yyyy-MM-dd)

**成功响应** (200 OK):
```json
[
  {
    "id": 1,
    "date": "2026-02-23",
    "recipe": {
      "id": 1,
      "name": "Tomato Soup"
    }
  }
]
```

---

### 4. 创建餐食计划

**接口地址**: `POST /meal-plans`

**请求参数**:
```json
{
  "date": "2026-02-23",
  "recipeId": 1
}
```

**成功响应** (200 OK):
```json
{
  "id": 1,
  "date": "2026-02-23",
  "recipe": {
    "id": 1,
    "name": "Tomato Soup"
  }
}
```

---

### 5. 更新餐食计划

**接口地址**: `PUT /meal-plans/{id}`

**路径参数**:
- id: 餐食计划ID

**请求参数**:
```json
{
  "date": "2026-02-24",
  "recipeId": 2
}
```

**成功响应** (200 OK):
```json
{
  "id": 1,
  "date": "2026-02-24",
  "recipe": {
    "id": 2,
    "name": "Chicken Curry"
  }
}
```

---

### 6. 删除餐食计划

**接口地址**: `DELETE /meal-plans/{id}`

**路径参数**:
- id: 餐食计划ID

**成功响应** (204 No Content):
- 无响应体

---

## 收据识别接口

### 1. 上传收据图片识别食材

**接口地址**: `POST /api/inventory/detect`

**完整URL**: `https://163.221.152.191:8080/api/inventory/detect`

**请求格式**: multipart/form-data

**请求参数**:
- image: 收据图片文件（必填，类型为 File）

**请求头**:
- X-User-Id: 1 (必填)

**成功响应** (200 OK):
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
    },
    {
      "id": 3,
      "name": "Olive Oil"
    }
  ]
}
```

**错误响应** (400 Bad Request):
```json
{
  "detectedItems": [],
  "message": "Image file is empty"
}
```

**错误响应** (500 Internal Server Error):
```json
{
  "error": "Receipt detection failed: ...",
  "code": 500
}
```

**支持的文件格式**:
- image/jpeg (JPG)
- image/png (PNG)

**文件大小限制**:
- 最大10MB

**说明**:
- 使用AI/OCR技术识别收据中的食材
- 返回识别出的食材列表
- 前端可以批量添加到库存

---

## 错误处理

### HTTP状态码

| 状态码 | 说明 | 示例场景 |
|--------|------|-----------|
| 200 | 成功 | 操作成功完成 |
| 204 | 成功（无内容） | 删除操作成功 |
| 400 | 错误请求 | 参数缺失或无效 |
| 404 | 未找到 | 资源不存在 |
| 500 | 服务器错误 | 内部处理错误 |

### 错误响应格式

#### 标准错误响应
```json
{
  "error": "错误描述",
  "code": 400
}
```

#### 用户相关错误响应
```json
{
  "success": false,
  "message": "错误描述"
}
```

### 常见错误场景

| 错误信息 | 状态码 | 解决方案 |
|---------|--------|---------|
| X-User-Id header is required | 400 | 确保用户已登录并传递X-User-Id header |
| Username is required | 400 | 提供用户名 |
| Password is required | 400 | 提供密码 |
| Username already exists | 400 | 使用不同的用户名 |
| User not found | 400 | 检查用户名是否正确 |
| Invalid password | 400 | 检查密码是否正确 |
| Ingredient name is required | 400 | 提供食材名称 |
| Inventory not found | 404 | 检查库存项ID是否正确 |
| Failed to add to inventory | 500 | 检查数据库连接 |
| Failed to get inventory | 500 | 检查数据库连接 |
| Receipt detection failed | 500 | 检查收据图片格式和大小 |

---

## 数据隔离

### 用户ID传递

所有需要用户身份验证的接口都通过`X-User-Id` header传递用户ID：

```javascript
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
const userId = user?.id;

const headers = {
  'Content-Type': 'application/json',
  'X-User-Id': userId.toString()
};
```

### 数据隔离规则

| 接口 | 隔离规则 |
|------|---------|
| GET /inventory | 只返回当前用户的库存 |
| POST /inventory | 只添加到当前用户的库存 |
| PUT /inventory/{id} | 只能更新当前用户的库存 |
| DELETE /inventory/{id} | 只能删除当前用户的库存 |
| GET /recipes | 只返回当前用户的食谱 |
| POST /recipes | 只创建为当前用户的食谱 |
| PUT /recipes/{id} | 只能更新当前用户的食谱 |
| DELETE /recipes/{id} | 只能删除当前用户的食谱 |

### 数据隔离实现

后端通过`userId`字段实现数据隔离：

```java
// 库存查询
List<Inventory> inventories = entityManager.createQuery(
    "SELECT i FROM Inventory i WHERE i.userId = :userId ORDER BY i.id", 
    Inventory.class
).setParameter("userId", userId)
.getResultList();

// 食谱查询
List<Recipe> recipes = entityManager.createQuery(
    "SELECT r FROM Recipe r WHERE r.userId = :userId ORDER BY r.id", 
    Recipe.class
).setParameter("userId", userId)
.getResultList();
```

---

## 前端API调用示例

### 使用fetchAPI

```typescript
import { API_ENDPOINTS, fetchAPI } from "../config/api";

// 获取库存
const inventory = await fetchAPI(API_ENDPOINTS.INVENTORY);

// 添加到库存
const result = await fetchAPI(API_ENDPOINTS.INVENTORY, {
  method: 'POST',
  body: JSON.stringify({
    name: "Tomatoes",
    category: "Vegetables"
  })
});
```

### 使用uploadReceiptImage

```typescript
import { uploadReceiptImage } from "../config/api";

// 上传收据图片
const file = fileInput.files[0];
const result = await uploadReceiptImage(file);

console.log('Detected ingredients:', result.detectedItems);
```

---

## 测试工具

### Curl测试

#### 测试用户登录
```bash
curl -X POST https://foodflow-pblclass.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

#### 测试获取库存
```bash
curl -X GET https://foodflow-pblclass.onrender.com/api/inventory \
  -H "X-User-Id: 1"
```

#### 测试添加到库存
```bash
curl -X POST https://foodflow-pblclass.onrender.com/api/inventory \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{"name":"Tomatoes","category":"Vegetables"}'
```

#### 测试收据识别
```bash
curl -X POST http://163.221.152.191:8080/api/inventory/detect \
  -H "X-User-Id: 1" \
  -F "image=@receipt.jpg"
```

### Postman测试

#### 导入环境变量

```
API_BASE_URL = https://foodflow-pblclass.onrender.com/api
DETECT_API_BASE_URL = http://163.221.152.191:8080
USER_ID = 1
```

#### 测试用户登录

```
Method: POST
URL: {{API_BASE_URL}}/users/login
Headers:
  Content-Type: application/json
Body (raw):
{
  "username": "testuser",
  "password": "password123"
}
```

#### 测试获取库存

```
Method: GET
URL: {{API_BASE_URL}}/inventory
Headers:
  X-User-Id: {{USER_ID}}
```

#### 测试收据识别

```
Method: POST
URL: {{DETECT_API_BASE_URL}}/api/inventory/detect
Headers:
  X-User-Id: {{USER_ID}}
Body (form-data):
  image: [选择收据图片文件]
```

---

## 版本历史

### v1.0.0 (2026-02-23)
- 初始版本
- 用户管理接口
- 库存管理接口
- 食谱管理接口
- 餐食计划接口
- 收据识别接口

### v1.1.0 (2026-02-23)
- 添加数据隔离功能
- 添加X-User-Id header认证
- 优化错误响应格式

### v1.2.0 (2026-02-23)
- 修复Mixed Content错误
- 添加HTTPS fallback机制
- 优化收据识别功能

---

## 联系方式

如有问题或建议，请联系：

- **项目地址**: https://github.com/kaxixi6666/FoodFlow_pblclass
- **文档更新**: 2026-02-23

---

**文档版本**: v1.2.0  
**最后更新**: 2026-02-23

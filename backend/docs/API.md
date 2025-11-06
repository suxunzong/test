# Calendar Task Planner API 文档

## 基本信息

- **Base URL**: `http://localhost:8080/api`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

## 认证说明（预留）

当前版本不需要认证。未来添加用户系统后，所有API需要在请求头中携带JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

---

## API 接口列表

### 1. 获取所有任务

**GET** `/tasks`

获取所有任务列表，按显示顺序排序。

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "完成项目报告",
    "isUrgent": true,
    "category": "工作",
    "color": "#FF6B6B",
    "startDate": "2025-11-06",
    "endDate": "2025-11-08",
    "expanded": true,
    "displayOrder": 0,
    "userId": null,
    "subTasks": [
      {
        "id": 1,
        "name": "收集数据",
        "completed": true,
        "displayOrder": 0
      },
      {
        "id": 2,
        "name": "撰写报告",
        "completed": false,
        "displayOrder": 1
      }
    ]
  }
]
```

---

### 2. 按日期范围查询任务

**GET** `/tasks/range?startDate={startDate}&endDate={endDate}`

查询指定日期范围内的任务。

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | Date | 是 | 开始日期 (YYYY-MM-DD) |
| endDate | Date | 是 | 结束日期 (YYYY-MM-DD) |

**请求示例**:
```
GET /api/tasks/range?startDate=2025-11-01&endDate=2025-11-30
```

**响应**: 同"获取所有任务"

---

### 3. 获取单个任务详情

**GET** `/tasks/{id}`

根据ID获取任务详情。

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 任务ID |

**响应**: 单个任务对象（格式同上）

**错误响应**:
```json
{
  "timestamp": "2025-11-06T10:30:00",
  "status": 500,
  "error": "操作失败",
  "message": "任务不存在: 999"
}
```

---

### 4. 创建新任务

**POST** `/tasks`

创建一个新任务。

**请求体**:
```json
{
  "name": "学习Spring Boot",
  "isUrgent": false,
  "category": "学习",
  "color": "#4ECDC4",
  "startDate": "2025-11-10",
  "endDate": "2025-11-15",
  "subTasks": [
    {
      "name": "阅读官方文档",
      "completed": false,
      "displayOrder": 0
    },
    {
      "name": "编写示例代码",
      "completed": false,
      "displayOrder": 1
    }
  ]
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 任务名称 |
| isUrgent | Boolean | 否 | 是否紧急，默认false |
| category | String | 否 | 任务分类 |
| color | String | 是 | 显示颜色（HEX格式） |
| startDate | Date | 是 | 开始日期 |
| endDate | Date | 是 | 结束日期 |
| subTasks | Array | 否 | 子任务列表 |

**响应**: 创建成功的任务对象（包含生成的ID）

---

### 5. 更新任务

**PUT** `/tasks/{id}`

更新指定任务的所有信息。

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 任务ID |

**请求体**: 同"创建新任务"

**响应**: 更新后的任务对象

**说明**:
- 子任务列表会完全替换（删除不在新列表中的子任务）
- 要删除所有子任务，传递空数组 `subTasks: []`

---

### 6. 扩展任务结束日期

**PATCH** `/tasks/{id}/extend`

扩展任务的结束日期（用于拖拽功能）。

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 任务ID |

**请求体**:
```json
{
  "endDate": "2025-11-20"
}
```

**响应**: 更新后的任务对象

**错误**: 结束日期不能早于开始日期

---

### 7. 删除任务

**DELETE** `/tasks/{id}`

删除指定任务（包括所有子任务）。

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 任务ID |

**响应**: `204 No Content`

---

### 8. 重新排序任务

**PUT** `/tasks/reorder`

批量更新任务的显示顺序。

**请求体**:
```json
[3, 1, 5, 2, 4]
```

**说明**: 数组中的数字是任务ID，数组顺序即为新的显示顺序

**响应**: 重新排序后的所有任务列表

---

### 9. 切换子任务完成状态

**PATCH** `/tasks/{taskId}/subtasks/{subTaskId}/toggle`

切换子任务的完成/未完成状态。

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| taskId | Long | 任务ID |
| subTaskId | Long | 子任务ID |

**响应**: 更新后的任务对象（包含所有子任务）

---

### 10. 重新排序子任务

**PUT** `/tasks/{taskId}/subtasks/reorder`

批量更新子任务的显示顺序。

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| taskId | Long | 任务ID |

**请求体**:
```json
[3, 1, 2]
```

**说明**: 数组中的数字是子任务ID，数组顺序即为新的显示顺序

**响应**: 更新后的任务对象

---

## 错误码说明

| HTTP状态码 | 说明 |
|------------|------|
| 200 OK | 请求成功 |
| 201 Created | 创建成功 |
| 204 No Content | 删除成功 |
| 400 Bad Request | 参数校验失败 |
| 404 Not Found | 资源不存在 |
| 500 Internal Server Error | 服务器内部错误 |

## 参数校验错误格式

```json
{
  "timestamp": "2025-11-06T10:30:00",
  "status": 400,
  "error": "参数校验失败",
  "validationErrors": {
    "name": "任务名称不能为空",
    "color": "颜色不能为空",
    "startDate": "开始日期不能为空"
  }
}
```

---

## 前端对接示例

### 使用 Fetch API

```javascript
// 获取所有任务
async function getAllTasks() {
  const response = await fetch('http://localhost:8080/api/tasks');
  const tasks = await response.json();
  return tasks;
}

// 创建新任务
async function createTask(taskData) {
  const response = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  return response.json();
}

// 更新任务
async function updateTask(id, taskData) {
  const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  return response.json();
}

// 删除任务
async function deleteTask(id) {
  await fetch(`http://localhost:8080/api/tasks/${id}`, {
    method: 'DELETE',
  });
}

// 扩展任务结束日期
async function extendTask(id, newEndDate) {
  const response = await fetch(`http://localhost:8080/api/tasks/${id}/extend`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endDate: newEndDate }),
  });
  return response.json();
}

// 切换子任务完成状态
async function toggleSubTask(taskId, subTaskId) {
  const response = await fetch(
    `http://localhost:8080/api/tasks/${taskId}/subtasks/${subTaskId}/toggle`,
    { method: 'PATCH' }
  );
  return response.json();
}

// 重新排序任务
async function reorderTasks(taskIds) {
  const response = await fetch('http://localhost:8080/api/tasks/reorder', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskIds),
  });
  return response.json();
}
```

---

## 未来扩展接口（预留）

### 用户认证相关

```
POST   /api/auth/register       # 用户注册
POST   /api/auth/login          # 用户登录
POST   /api/auth/logout         # 用户登出
GET    /api/auth/me             # 获取当前用户信息
PUT    /api/auth/profile        # 更新用户资料

GET    /api/users/{userId}/tasks  # 获取指定用户的任务
```

### 任务提醒功能

```
POST   /api/tasks/{id}/reminders              # 创建任务提醒
GET    /api/tasks/{id}/reminders              # 获取任务的所有提醒
DELETE /api/tasks/{id}/reminders/{reminderId} # 删除提醒
```

### 重复任务功能

```
POST   /api/tasks/{id}/recurrence    # 设置任务重复规则
GET    /api/tasks/{id}/recurrence    # 获取任务重复规则
DELETE /api/tasks/{id}/recurrence    # 删除重复规则
```

### 任务分享功能

```
POST   /api/tasks/{id}/share         # 分享任务给其他用户
GET    /api/tasks/{id}/shares        # 获取任务的分享列表
DELETE /api/tasks/{id}/shares/{shareId}  # 取消分享
```

---

## 数据库配置

修改 `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/calendar_planner?createDatabaseIfNotExist=true
    username: root
    password: your_password
```

## 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

服务启动后访问: http://localhost:8080/api/tasks

# 数据库设计文档

## 概述
日历任务计划器数据库设计，支持任务管理、子任务跟踪，预留用户认证扩展接口。

## 数据库表结构

### 1. tasks 表（任务主表）
```sql
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '任务ID',
    name VARCHAR(255) NOT NULL COMMENT '任务名称',
    is_urgent BOOLEAN DEFAULT FALSE COMMENT '是否紧急',
    category VARCHAR(100) COMMENT '任务分类',
    color VARCHAR(20) NOT NULL COMMENT '显示颜色（HEX格式）',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    expanded BOOLEAN DEFAULT FALSE COMMENT '是否展开（前端状态）',
    display_order INT DEFAULT 0 COMMENT '显示顺序',

    -- 预留字段：未来支持用户系统
    user_id BIGINT COMMENT '所属用户ID（预留）',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_user_id (user_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务主表';
```

### 2. sub_tasks 表（子任务表）
```sql
CREATE TABLE sub_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '子任务ID',
    task_id BIGINT NOT NULL COMMENT '所属任务ID',
    name VARCHAR(255) NOT NULL COMMENT '子任务名称',
    completed BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    display_order INT DEFAULT 0 COMMENT '显示顺序',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子任务表';
```

### 3. users 表（用户表 - 预留）
```sql
-- 未来添加用户系统时使用
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    full_name VARCHAR(100) COMMENT '真实姓名',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_at TIMESTAMP COMMENT '最后登录时间',

    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表（预留）';
```

## 数据表关系

```
users (预留)
  |
  └──> tasks (一对多)
         |
         └──> sub_tasks (一对多，级联删除)
```

## 字段说明

### tasks 表核心字段
- **id**: 主键，自增
- **name**: 任务名称，必填
- **is_urgent**: 紧急标记，用于前端红色边框显示
- **category**: 任务分类（工作/学习/生活等）
- **color**: 任务颜色，HEX格式（如 #FF6B6B）
- **start_date/end_date**: 任务占用的日期范围
- **expanded**: 前端展开状态（是否显示子任务）
- **display_order**: 显示顺序，用于拖拽排序
- **user_id**: 预留字段，未来支持多用户时关联用户

### sub_tasks 表核心字段
- **id**: 主键，自增
- **task_id**: 外键，关联 tasks 表
- **name**: 子任务名称
- **completed**: 完成状态，用于前端打勾显示
- **display_order**: 显示顺序，用于拖拽排序

## 索引策略

1. **日期索引**: 加速按日期范围查询任务
2. **用户索引**: 预留，未来支持按用户查询
3. **排序索引**: 加速任务和子任务的排序查询

## 数据约束

1. **外键约束**: sub_tasks.task_id → tasks.id (CASCADE DELETE)
2. **非空约束**: 任务名称、日期、颜色必填
3. **默认值**: is_urgent、expanded、completed 默认 false

## 扩展性设计

### 未来可添加的表

1. **task_reminders 表**: 任务提醒功能
```sql
CREATE TABLE task_reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL,
    remind_at TIMESTAMP NOT NULL,
    remind_type ENUM('email', 'push', 'sms'),
    is_sent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

2. **task_recurrence 表**: 重复任务功能
```sql
CREATE TABLE task_recurrence (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL,
    recurrence_pattern ENUM('daily', 'weekly', 'monthly', 'yearly'),
    recurrence_interval INT DEFAULT 1,
    end_date DATE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

3. **task_shares 表**: 任务分享功能
```sql
CREATE TABLE task_shares (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL,
    shared_with_user_id BIGINT NOT NULL,
    permission ENUM('view', 'edit'),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 数据迁移策略

当添加用户系统时：
1. 添加 users 表
2. 为现有任务设置默认用户（如 user_id = 1）
3. 启用 tasks 表的 user_id 外键约束
4. 更新 API 接口，添加用户认证中间件

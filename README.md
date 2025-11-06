# 日历任务计划器 (Calendar Task Planner)

一个功能完整的日历任务管理系统，支持任务创建、拖拽扩展、子任务管理、进度跟踪等功能。

## 项目特点

- ✅ **前后端分离架构**
- ✅ **拖拽交互**：支持任务时间范围拖拽扩展、任务排序、子任务排序
- ✅ **智能显示**：多任务滚动查看，支持滚轮和键盘操作
- ✅ **进度跟踪**：子任务完成度可视化
- ✅ **数据持久化**：MySQL数据库存储
- ✅ **预留扩展**：用户认证接口已预留，便于未来添加多用户功能

## 技术栈

### 前端
- **React 18** + **TypeScript**
- **Vite** 构建工具
- 纯CSS样式（可扩展为CSS Modules或styled-components）

### 后端
- **Spring Boot 3.2**
- **Spring Data JPA**
- **MySQL 8.0**
- **Maven**

## 快速开始

### 前置要求
- Node.js 16+
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### 1. 数据库准备

```sql
CREATE DATABASE calendar_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 后端启动

```bash
cd backend
# 修改 src/main/resources/application.yml 中的数据库密码
mvn spring-boot:run
```

后端服务: `http://localhost:8080`

### 3. 前端启动

```bash
npm install
npm run dev
```

前端服务: `http://localhost:5173`

## 核心功能

- **日历视图**：月视图、任务拖拽扩展、跨月显示
- **任务管理**：创建/编辑/删除、分类、颜色、紧急标记
- **子任务系统**：完成度追踪、拖拽排序
- **智能交互**：滚轮/键盘查看多任务

## 文档

- [API文档](backend/docs/API.md)
- [数据库设计](backend/docs/database-design.md)

## 未来扩展

- 用户认证系统（JWT）
- 任务提醒功能
- 重复任务
- 任务分享与协作

## 许可证

MIT License

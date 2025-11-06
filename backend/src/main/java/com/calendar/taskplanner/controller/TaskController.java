package com.calendar.taskplanner.controller;

import com.calendar.taskplanner.dto.TaskDTO;
import com.calendar.taskplanner.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 任务管理 API Controller
 * 提供 RESTful API 接口
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}", allowedHeaders = "*", allowCredentials = "true")
public class TaskController {

    private final TaskService taskService;

    /**
     * 获取所有任务
     * GET /api/tasks
     */
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        log.info("API: 获取所有任务");
        List<TaskDTO> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    /**
     * 根据日期范围查询任务
     * GET /api/tasks/range?startDate=2025-01-01&endDate=2025-01-31
     */
    @GetMapping("/range")
    public ResponseEntity<List<TaskDTO>> getTasksByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("API: 查询日期范围任务: {} 到 {}", startDate, endDate);
        List<TaskDTO> tasks = taskService.getTasksByDateRange(startDate, endDate);
        return ResponseEntity.ok(tasks);
    }

    /**
     * 根据ID获取单个任务
     * GET /api/tasks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        log.info("API: 获取任务详情: {}", id);
        TaskDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    /**
     * 创建新任务
     * POST /api/tasks
     */
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        log.info("API: 创建新任务: {}", taskDTO.getName());
        TaskDTO createdTask = taskService.createTask(taskDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    /**
     * 更新任务
     * PUT /api/tasks/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDTO taskDTO) {
        log.info("API: 更新任务: {}", id);
        TaskDTO updatedTask = taskService.updateTask(id, taskDTO);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * 扩展任务结束日期（拖拽功能）
     * PATCH /api/tasks/{id}/extend
     */
    @PatchMapping("/{id}/extend")
    public ResponseEntity<TaskDTO> extendTaskEndDate(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("API: 扩展任务 {} 的结束日期", id);
        LocalDate newEndDate = LocalDate.parse(request.get("endDate"));
        TaskDTO updatedTask = taskService.extendTaskEndDate(id, newEndDate);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * 删除任务
     * DELETE /api/tasks/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        log.info("API: 删除任务: {}", id);
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 重新排序任务
     * PUT /api/tasks/reorder
     */
    @PutMapping("/reorder")
    public ResponseEntity<List<TaskDTO>> reorderTasks(@RequestBody List<Long> taskIds) {
        log.info("API: 重新排序任务");
        List<TaskDTO> tasks = taskService.reorderTasks(taskIds);
        return ResponseEntity.ok(tasks);
    }

    /**
     * 切换子任务完成状态
     * PATCH /api/tasks/{taskId}/subtasks/{subTaskId}/toggle
     */
    @PatchMapping("/{taskId}/subtasks/{subTaskId}/toggle")
    public ResponseEntity<TaskDTO> toggleSubTaskCompletion(
            @PathVariable Long taskId,
            @PathVariable Long subTaskId) {
        log.info("API: 切换子任务 {} 的完成状态", subTaskId);
        TaskDTO task = taskService.toggleSubTaskCompletion(taskId, subTaskId);
        return ResponseEntity.ok(task);
    }

    /**
     * 重新排序子任务
     * PUT /api/tasks/{taskId}/subtasks/reorder
     */
    @PutMapping("/{taskId}/subtasks/reorder")
    public ResponseEntity<TaskDTO> reorderSubTasks(
            @PathVariable Long taskId,
            @RequestBody List<Long> subTaskIds) {
        log.info("API: 重新排序任务 {} 的子任务", taskId);
        TaskDTO task = taskService.reorderSubTasks(taskId, subTaskIds);
        return ResponseEntity.ok(task);
    }

    // ========== 预留：未来用户认证相关接口 ==========

    /**
     * 获取当前用户的所有任务（预留）
     * GET /api/users/{userId}/tasks
     *
     * 未来添加用户系统后，需要：
     * 1. 启用 Spring Security
     * 2. 从 JWT Token 中获取当前用户 ID
     * 3. 只返回该用户的任务
     */
    // @GetMapping("/users/{userId}/tasks")
    // public ResponseEntity<List<TaskDTO>> getUserTasks(@PathVariable Long userId) {
    //     List<TaskDTO> tasks = taskService.getTasksByUserId(userId);
    //     return ResponseEntity.ok(tasks);
    // }
}

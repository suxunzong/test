package com.calendar.taskplanner.service;

import com.calendar.taskplanner.dto.SubTaskDTO;
import com.calendar.taskplanner.dto.TaskDTO;
import com.calendar.taskplanner.entity.SubTask;
import com.calendar.taskplanner.entity.Task;
import com.calendar.taskplanner.repository.SubTaskRepository;
import com.calendar.taskplanner.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final SubTaskRepository subTaskRepository;

    /**
     * 获取所有任务
     */
    public List<TaskDTO> getAllTasks() {
        log.debug("获取所有任务");
        List<Task> tasks = taskRepository.findAllByOrderByDisplayOrderAsc();
        return tasks.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 根据日期范围查询任务
     */
    public List<TaskDTO> getTasksByDateRange(LocalDate startDate, LocalDate endDate) {
        log.debug("查询日期范围任务: {} 到 {}", startDate, endDate);
        List<Task> tasks = taskRepository.findByDateRange(startDate, endDate);
        return tasks.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 根据ID获取任务
     */
    public TaskDTO getTaskById(Long id) {
        log.debug("根据ID获取任务: {}", id);
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("任务不存在: " + id));
        return convertToDTO(task);
    }

    /**
     * 创建新任务
     */
    @Transactional
    public TaskDTO createTask(TaskDTO taskDTO) {
        log.info("创建新任务: {}", taskDTO.getName());

        Task task = convertToEntity(taskDTO);

        // 如果没有指定显示顺序，设置为最大值+1
        if (task.getDisplayOrder() == null || task.getDisplayOrder() == 0) {
            Long maxOrder = taskRepository.findAll().stream()
                .map(Task::getDisplayOrder)
                .max(Integer::compareTo)
                .orElse(0);
            task.setDisplayOrder(maxOrder.intValue() + 1);
        }

        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    /**
     * 更新任务
     */
    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        log.info("更新任务: {}", id);

        Task existingTask = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("任务不存在: " + id));

        // 更新基本字段
        existingTask.setName(taskDTO.getName());
        existingTask.setIsUrgent(taskDTO.getIsUrgent());
        existingTask.setCategory(taskDTO.getCategory());
        existingTask.setColor(taskDTO.getColor());
        existingTask.setStartDate(taskDTO.getStartDate());
        existingTask.setEndDate(taskDTO.getEndDate());
        existingTask.setExpanded(taskDTO.getExpanded());

        // 更新子任务
        if (taskDTO.getSubTasks() != null) {
            // 删除不在新列表中的子任务
            List<Long> newSubTaskIds = taskDTO.getSubTasks().stream()
                .map(SubTaskDTO::getId)
                .filter(subId -> subId != null)
                .collect(Collectors.toList());

            existingTask.getSubTasks().removeIf(st -> !newSubTaskIds.contains(st.getId()));

            // 更新或添加子任务
            for (SubTaskDTO subTaskDTO : taskDTO.getSubTasks()) {
                if (subTaskDTO.getId() != null) {
                    // 更新现有子任务
                    SubTask existingSubTask = existingTask.getSubTasks().stream()
                        .filter(st -> st.getId().equals(subTaskDTO.getId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("子任务不存在: " + subTaskDTO.getId()));

                    existingSubTask.setName(subTaskDTO.getName());
                    existingSubTask.setCompleted(subTaskDTO.getCompleted());
                    existingSubTask.setDisplayOrder(subTaskDTO.getDisplayOrder());
                } else {
                    // 添加新子任务
                    SubTask newSubTask = new SubTask();
                    newSubTask.setName(subTaskDTO.getName());
                    newSubTask.setCompleted(subTaskDTO.getCompleted());
                    newSubTask.setDisplayOrder(subTaskDTO.getDisplayOrder());
                    existingTask.addSubTask(newSubTask);
                }
            }
        }

        Task updatedTask = taskRepository.save(existingTask);
        return convertToDTO(updatedTask);
    }

    /**
     * 扩展任务的结束日期（拖拽功能）
     */
    @Transactional
    public TaskDTO extendTaskEndDate(Long id, LocalDate newEndDate) {
        log.info("扩展任务 {} 的结束日期到: {}", id, newEndDate);

        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("任务不存在: " + id));

        if (newEndDate.isBefore(task.getStartDate())) {
            throw new RuntimeException("结束日期不能早于开始日期");
        }

        task.setEndDate(newEndDate);
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    /**
     * 删除任务
     */
    @Transactional
    public void deleteTask(Long id) {
        log.info("删除任务: {}", id);

        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("任务不存在: " + id);
        }

        taskRepository.deleteById(id);
    }

    /**
     * 重新排序任务
     */
    @Transactional
    public List<TaskDTO> reorderTasks(List<Long> taskIds) {
        log.info("重新排序任务，数量: {}", taskIds.size());

        for (int i = 0; i < taskIds.size(); i++) {
            Long taskId = taskIds.get(i);
            Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("任务不存在: " + taskId));
            task.setDisplayOrder(i);
            taskRepository.save(task);
        }

        return getAllTasks();
    }

    /**
     * 切换子任务完成状态
     */
    @Transactional
    public TaskDTO toggleSubTaskCompletion(Long taskId, Long subTaskId) {
        log.info("切换子任务 {} 的完成状态", subTaskId);

        SubTask subTask = subTaskRepository.findById(subTaskId)
            .orElseThrow(() -> new RuntimeException("子任务不存在: " + subTaskId));

        subTask.setCompleted(!subTask.getCompleted());
        subTaskRepository.save(subTask);

        return getTaskById(taskId);
    }

    /**
     * 重新排序子任务
     */
    @Transactional
    public TaskDTO reorderSubTasks(Long taskId, List<Long> subTaskIds) {
        log.info("重新排序任务 {} 的子任务", taskId);

        for (int i = 0; i < subTaskIds.size(); i++) {
            Long subTaskId = subTaskIds.get(i);
            SubTask subTask = subTaskRepository.findById(subTaskId)
                .orElseThrow(() -> new RuntimeException("子任务不存在: " + subTaskId));
            subTask.setDisplayOrder(i);
            subTaskRepository.save(subTask);
        }

        return getTaskById(taskId);
    }

    // ========== 工具方法 ==========

    /**
     * Entity 转 DTO
     */
    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setName(task.getName());
        dto.setIsUrgent(task.getIsUrgent());
        dto.setCategory(task.getCategory());
        dto.setColor(task.getColor());
        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setExpanded(task.getExpanded());
        dto.setDisplayOrder(task.getDisplayOrder());
        dto.setUserId(task.getUserId());

        if (task.getSubTasks() != null) {
            dto.setSubTasks(task.getSubTasks().stream()
                .map(this::convertSubTaskToDTO)
                .collect(Collectors.toList()));
        }

        return dto;
    }

    /**
     * SubTask Entity 转 DTO
     */
    private SubTaskDTO convertSubTaskToDTO(SubTask subTask) {
        SubTaskDTO dto = new SubTaskDTO();
        dto.setId(subTask.getId());
        dto.setName(subTask.getName());
        dto.setCompleted(subTask.getCompleted());
        dto.setDisplayOrder(subTask.getDisplayOrder());
        return dto;
    }

    /**
     * DTO 转 Entity
     */
    private Task convertToEntity(TaskDTO dto) {
        Task task = new Task();
        task.setName(dto.getName());
        task.setIsUrgent(dto.getIsUrgent());
        task.setCategory(dto.getCategory());
        task.setColor(dto.getColor());
        task.setStartDate(dto.getStartDate());
        task.setEndDate(dto.getEndDate());
        task.setExpanded(dto.getExpanded());
        task.setDisplayOrder(dto.getDisplayOrder());
        task.setUserId(dto.getUserId());

        if (dto.getSubTasks() != null) {
            for (SubTaskDTO subTaskDTO : dto.getSubTasks()) {
                SubTask subTask = new SubTask();
                subTask.setName(subTaskDTO.getName());
                subTask.setCompleted(subTaskDTO.getCompleted());
                subTask.setDisplayOrder(subTaskDTO.getDisplayOrder());
                task.addSubTask(subTask);
            }
        }

        return task;
    }
}

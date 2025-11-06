package com.calendar.taskplanner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 任务数据传输对象
 * 用于API请求和响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {

    private Long id;

    @NotBlank(message = "任务名称不能为空")
    private String name;

    private Boolean isUrgent = false;

    private String category;

    @NotBlank(message = "颜色不能为空")
    private String color;

    @NotNull(message = "开始日期不能为空")
    private LocalDate startDate;

    @NotNull(message = "结束日期不能为空")
    private LocalDate endDate;

    private Boolean expanded = false;

    private Integer displayOrder = 0;

    private List<SubTaskDTO> subTasks = new ArrayList<>();

    // 预留：未来支持用户ID
    private Long userId;
}

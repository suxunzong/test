package com.calendar.taskplanner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 子任务数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubTaskDTO {

    private Long id;

    @NotBlank(message = "子任务名称不能为空")
    private String name;

    private Boolean completed = false;

    private Integer displayOrder = 0;
}

package com.calendar.taskplanner.repository;

import com.calendar.taskplanner.entity.SubTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubTaskRepository extends JpaRepository<SubTask, Long> {

    /**
     * 根据任务ID查询所有子任务
     */
    List<SubTask> findByTaskIdOrderByDisplayOrderAsc(Long taskId);

    /**
     * 根据任务ID删除所有子任务
     */
    void deleteByTaskId(Long taskId);

    /**
     * 统计任务的子任务数量
     */
    Long countByTaskId(Long taskId);

    /**
     * 统计任务已完成的子任务数量
     */
    Long countByTaskIdAndCompletedTrue(Long taskId);
}

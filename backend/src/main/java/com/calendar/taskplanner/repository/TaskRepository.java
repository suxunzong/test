package com.calendar.taskplanner.repository;

import com.calendar.taskplanner.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * 查询所有任务，按显示顺序排序
     */
    List<Task> findAllByOrderByDisplayOrderAsc();

    /**
     * 根据日期范围查询任务
     * 查询开始日期在指定范围内，或结束日期在指定范围内，或跨越指定范围的任务
     */
    @Query("SELECT t FROM Task t WHERE " +
           "(t.startDate BETWEEN :startDate AND :endDate) OR " +
           "(t.endDate BETWEEN :startDate AND :endDate) OR " +
           "(t.startDate <= :startDate AND t.endDate >= :endDate) " +
           "ORDER BY t.displayOrder ASC")
    List<Task> findByDateRange(@Param("startDate") LocalDate startDate,
                                @Param("endDate") LocalDate endDate);

    /**
     * 根据用户ID查询任务（预留）
     * 未来添加用户系统时使用
     */
    List<Task> findByUserIdOrderByDisplayOrderAsc(Long userId);

    /**
     * 根据分类查询任务
     */
    List<Task> findByCategoryOrderByDisplayOrderAsc(String category);

    /**
     * 查询紧急任务
     */
    List<Task> findByIsUrgentTrueOrderByDisplayOrderAsc();

    /**
     * 查询指定日期有任务的数量
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE :date BETWEEN t.startDate AND t.endDate")
    Long countTasksByDate(@Param("date") LocalDate date);
}

import React, { useState, useEffect } from 'react';
import { Task, DayCell } from '../types';

interface CalendarProps {
  tasks: Task[];
  onDayClick: (date: string) => void;
  onTaskExtend: (taskId: string, newEndDate: string) => void;
}

export default function Calendar({ tasks, onDayClick, onTaskExtend }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayCell[]>([]);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [dragStartDate, setDragStartDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();

    const days: DayCell[] = [];

    // 上个月的日期
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date: formatDate(date),
        day,
        isCurrentMonth: false
      });
    }

    // 当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date: formatDate(date),
        day: i,
        isCurrentMonth: true
      });
    }

    // 下个月的日期（补齐6行）
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date: formatDate(date),
        day: i,
        isCurrentMonth: false
      });
    }

    setCalendarDays(days);
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTasksForDate = (date: string): Task[] => {
    return tasks.filter(task => {
      return date >= task.startDate && date <= task.endDate;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleMouseDown = (taskId: string, date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingTask(taskId);
    setDragStartDate(date);
  };

  const handleMouseEnter = (date: string) => {
    setHoveredDate(date);
  };

  const handleMouseUp = () => {
    if (draggingTask && hoveredDate && dragStartDate) {
      const task = tasks.find(t => t.id === draggingTask);
      if (task) {
        // 确保新的结束日期不早于开始日期
        if (hoveredDate >= task.startDate) {
          onTaskExtend(draggingTask, hoveredDate);
        }
      }
    }
    setDraggingTask(null);
    setDragStartDate(null);
    setHoveredDate(null);
  };

  const isDateInDragRange = (date: string): boolean => {
    if (!draggingTask || !dragStartDate || !hoveredDate) return false;

    const task = tasks.find(t => t.id === draggingTask);
    if (!task) return false;

    const start = task.startDate;
    const end = hoveredDate;

    return date >= start && date <= end;
  };

  const getDraggingTaskColor = (): string => {
    if (!draggingTask) return '';
    const task = tasks.find(t => t.id === draggingTask);
    return task?.color || '';
  };

  const monthYear = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 月份导航 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>{monthYear}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handlePrevMonth}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            上月
          </button>
          <button
            onClick={handleToday}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              backgroundColor: '#4ECDC4',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            今天
          </button>
          <button
            onClick={handleNextMonth}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            下月
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              padding: '12px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '14px',
              color: '#495057'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历格子 */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(6, 1fr)',
          gap: '1px',
          backgroundColor: '#dee2e6',
          overflow: 'auto'
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {calendarDays.map((dayCell, index) => {
          const dayTasks = getTasksForDate(dayCell.date);
          const isToday = dayCell.date === formatDate(new Date());
          const isDragging = isDateInDragRange(dayCell.date);

          return (
            <div
              key={index}
              onClick={() => dayCell.isCurrentMonth && onDayClick(dayCell.date)}
              onMouseEnter={() => handleMouseEnter(dayCell.date)}
              style={{
                backgroundColor: isDragging
                  ? `${getDraggingTaskColor()}40`
                  : 'white',
                padding: '8px',
                cursor: dayCell.isCurrentMonth ? 'pointer' : 'default',
                position: 'relative',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                opacity: dayCell.isCurrentMonth ? 1 : 0.4,
                border: isDragging ? `2px dashed ${getDraggingTaskColor()}` : 'none',
                transition: 'background-color 0.1s'
              }}
            >
              {/* 日期数字 */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: isToday ? 'bold' : 'normal',
                  color: isToday ? 'white' : dayCell.isCurrentMonth ? '#212529' : '#adb5bd',
                  marginBottom: '4px',
                  backgroundColor: isToday ? '#4ECDC4' : 'transparent',
                  borderRadius: isToday ? '50%' : '0',
                  width: isToday ? '24px' : 'auto',
                  height: isToday ? '24px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {dayCell.day}
              </div>

              {/* 任务标签 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    onMouseDown={(e) => handleMouseDown(task.id, dayCell.date, e)}
                    style={{
                      backgroundColor: task.color,
                      color: 'white',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'grab',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      border: task.isUrgent ? '2px solid #dc3545' : 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                    }}
                    title={task.name}
                  >
                    {task.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

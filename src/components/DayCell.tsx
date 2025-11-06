import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';

interface DayCellProps {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
  isDragging: boolean;
  draggingColor: string;
  onDayClick: () => void;
  onMouseEnter: () => void;
  onTaskMouseDown: (taskId: string, e: React.MouseEvent) => void;
}

const MAX_VISIBLE_TASKS = 2; // 最多显示2个任务

export default function DayCell({
  date: _date, // 保留给未来使用
  day,
  isCurrentMonth,
  isToday,
  tasks,
  isDragging,
  draggingColor,
  onDayClick,
  onMouseEnter,
  onTaskMouseDown
}: DayCellProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const cellRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 重置滚动位置当任务列表改变时
  useEffect(() => {
    setScrollIndex(0);
  }, [tasks.length]);

  // 处理滚轮事件
  const handleWheel = (e: React.WheelEvent) => {
    if (tasks.length <= MAX_VISIBLE_TASKS) return;

    e.stopPropagation();
    e.preventDefault();

    const delta = e.deltaY > 0 ? 1 : -1;
    const maxIndex = Math.max(0, tasks.length - MAX_VISIBLE_TASKS);
    const newIndex = Math.max(0, Math.min(maxIndex, scrollIndex + delta));
    setScrollIndex(newIndex);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (tasks.length <= MAX_VISIBLE_TASKS) return;

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.key === 'ArrowDown' ? 1 : -1;
      const maxIndex = Math.max(0, tasks.length - MAX_VISIBLE_TASKS);
      const newIndex = Math.max(0, Math.min(maxIndex, scrollIndex + delta));
      setScrollIndex(newIndex);
    }
  };

  // 显示的任务
  const visibleTasks = tasks.slice(scrollIndex, scrollIndex + MAX_VISIBLE_TASKS);
  const remainingCount = tasks.length - scrollIndex - MAX_VISIBLE_TASKS;

  return (
    <div
      ref={cellRef}
      tabIndex={0}
      onClick={onDayClick}
      onMouseEnter={onMouseEnter}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        backgroundColor: isDragging ? `${draggingColor}40` : 'white',
        padding: '8px',
        cursor: isCurrentMonth ? 'pointer' : 'default',
        position: 'relative',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        opacity: isCurrentMonth ? 1 : 0.4,
        border: isDragging
          ? `2px dashed ${draggingColor}`
          : isFocused && tasks.length > MAX_VISIBLE_TASKS
          ? '2px solid #4ECDC4'
          : 'none',
        transition: 'background-color 0.1s, border 0.2s',
        outline: 'none'
      }}
    >
      {/* 日期数字 */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: isToday ? 'bold' : 'normal',
          color: isToday ? 'white' : isCurrentMonth ? '#212529' : '#adb5bd',
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
        {day}
      </div>

      {/* 滚动指示器（上） */}
      {tasks.length > MAX_VISIBLE_TASKS && scrollIndex > 0 && (
        <div style={{
          fontSize: '10px',
          textAlign: 'center',
          color: '#6c757d',
          marginBottom: '2px'
        }}>
          ▲
        </div>
      )}

      {/* 任务标签 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {visibleTasks.map(task => (
          <div
            key={task.id}
            onMouseDown={(e) => onTaskMouseDown(task.id, e)}
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

        {/* 显示还有多少个任务 */}
        {remainingCount > 0 && (
          <div
            style={{
              fontSize: '11px',
              color: '#6c757d',
              textAlign: 'center',
              padding: '2px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="使用滚轮或方向键查看更多"
          >
            +{remainingCount}个
          </div>
        )}
      </div>

      {/* 滚动指示器（下） */}
      {tasks.length > MAX_VISIBLE_TASKS && remainingCount > 0 && (
        <div style={{
          fontSize: '10px',
          textAlign: 'center',
          color: '#6c757d',
          marginTop: '2px'
        }}>
          ▼
        </div>
      )}

      {/* 提示文字（仅在聚焦且有多个任务时显示） */}
      {isFocused && tasks.length > MAX_VISIBLE_TASKS && (
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          color: '#6c757d',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '2px 6px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          ↑↓ 滚轮查看
        </div>
      )}
    </div>
  );
}

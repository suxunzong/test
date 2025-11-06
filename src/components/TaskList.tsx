import React, { useState } from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggleExpand: (taskId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export default function TaskList({
  tasks,
  onToggleExpand,
  onToggleSubTask,
  onReorderTasks,
  onDeleteTask,
  onEditTask
}: TaskListProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTaskId(taskId);
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();

    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = tasks.findIndex(t => t.id === targetTaskId);

    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    onReorderTasks(newTasks);
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const getCompletedPercentage = (task: Task): number => {
    if (task.subTasks.length === 0) return 0;
    const completed = task.subTasks.filter(st => st.completed).length;
    return Math.round((completed / task.subTasks.length) * 100);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>工作计划</h2>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
          共 {tasks.length} 个任务
        </p>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px'
      }}>
        {tasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6c757d'
          }}>
            <p style={{ fontSize: '16px', margin: 0 }}>暂无任务</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>点击日历格子添加新任务</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={(e) => handleDragOver(e, task.id)}
              onDrop={(e) => handleDrop(e, task.id)}
              onDragEnd={handleDragEnd}
              style={{
                marginBottom: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: draggedTaskId === task.id
                  ? '0 4px 12px rgba(0,0,0,0.15)'
                  : '0 2px 4px rgba(0,0,0,0.1)',
                border: dragOverTaskId === task.id && draggedTaskId !== task.id
                  ? '2px dashed #4ECDC4'
                  : '2px solid transparent',
                transition: 'all 0.2s',
                cursor: 'grab',
                opacity: draggedTaskId === task.id ? 0.5 : 1
              }}
            >
              {/* 任务头部 */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: `${task.color}20`,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderLeft: `4px solid ${task.color}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* 展开/折叠按钮 */}
                  <button
                    onClick={() => onToggleExpand(task.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    {task.expanded ? '∧' : '∨'}
                  </button>

                  {/* 任务名称 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600 }}>
                        {task.name}
                      </span>
                      {task.isUrgent && (
                        <span style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          紧急
                        </span>
                      )}
                    </div>
                    {task.category && (
                      <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                        {task.category}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                      {task.startDate} {task.startDate !== task.endDate && `至 ${task.endDate}`}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#4ECDC4',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('确定要删除这个任务吗？')) {
                          onDeleteTask(task.id);
                        }
                      }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 进度条 */}
                {task.subTasks.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#6c757d' }}>
                        完成进度
                      </span>
                      <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: 600 }}>
                        {getCompletedPercentage(task)}%
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: task.color,
                        width: `${getCompletedPercentage(task)}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* 子任务列表 */}
              {task.expanded && task.subTasks.length > 0 && (
                <div style={{ padding: '12px' }}>
                  {task.subTasks.map(subTask => (
                    <div
                      key={subTask.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        marginBottom: '6px'
                      }}
                    >
                      <span style={{
                        flex: 1,
                        fontSize: '14px',
                        textDecoration: subTask.completed ? 'line-through' : 'none',
                        color: subTask.completed ? '#6c757d' : '#212529'
                      }}>
                        {subTask.name}
                      </span>
                      <button
                        onClick={() => onToggleSubTask(task.id, subTask.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `2px solid ${task.color}`,
                          backgroundColor: subTask.completed ? task.color : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          color: 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        {subTask.completed ? '✓' : ''}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

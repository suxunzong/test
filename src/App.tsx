import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import EventModal from './components/EventModal';
import { Task, SubTask } from './types';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // TODO: 替换为后端 API 调用 - GET /api/tasks
  // 未来集成用户认证后改为 GET /api/users/{userId}/tasks
  useEffect(() => {
    // 从 localStorage 加载数据（临时方案，后续替换为 API）
    const savedTasks = localStorage.getItem('calendar_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // TODO: 每次状态变化时保存到后端 API - PUT /api/tasks
  // 未来替换为单独的 API 调用，而不是统一保存
  useEffect(() => {
    localStorage.setItem('calendar_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // 打开添加事件模态框
  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  // 打开编辑事件模态框
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // 保存事件（新增或编辑）
  // TODO: 替换为 API 调用 - POST /api/tasks (新增) 或 PUT /api/tasks/{id} (编辑)
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'expanded'>) => {
    if (editingTask) {
      // 编辑现有任务
      setTasks(tasks.map(t =>
        t.id === editingTask.id
          ? { ...taskData, id: editingTask.id, expanded: editingTask.expanded }
          : t
      ));
    } else {
      // 新增任务
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(), // TODO: 后端生成 ID
        expanded: false
      };
      setTasks([...tasks, newTask]);
    }
  };

  // 删除任务
  // TODO: 替换为 API 调用 - DELETE /api/tasks/{id}
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // 扩展任务的时间范围（拖拽结束日期）
  // TODO: 替换为 API 调用 - PATCH /api/tasks/{id}/extend
  const handleTaskExtend = (taskId: string, newEndDate: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, endDate: newEndDate } : t
    ));
  };

  // 切换任务展开/折叠状态
  const handleToggleExpand = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, expanded: !t.expanded } : t
    ));
  };

  // 切换子任务完成状态
  // TODO: 替换为 API 调用 - PATCH /api/tasks/{taskId}/subtasks/{subTaskId}/toggle
  const handleToggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks.map(st =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return t;
    }));
  };

  // 重新排序任务
  // TODO: 替换为 API 调用 - PUT /api/tasks/reorder
  const handleReorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  // 重新排序子任务
  // TODO: 替换为 API 调用 - PUT /api/tasks/{taskId}/subtasks/reorder
  const handleReorderSubTasks = (taskId: string, newSubTasks: SubTask[]) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, subTasks: newSubTasks } : t
    ));
  };

  return (
    <div className="app">
      {/* 左侧任务列表 */}
      <div className="sidebar">
        <TaskList
          tasks={tasks}
          onToggleExpand={handleToggleExpand}
          onToggleSubTask={handleToggleSubTask}
          onReorderTasks={handleReorderTasks}
          onReorderSubTasks={handleReorderSubTasks}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
        />
      </div>

      {/* 右侧日历视图 */}
      <div className="main-content">
        <Calendar
          tasks={tasks}
          onDayClick={handleDayClick}
          onTaskExtend={handleTaskExtend}
        />
      </div>

      {/* 事件添加/编辑模态框 */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        selectedDate={selectedDate}
        editingTask={editingTask}
      />
    </div>
  );
}

export default App;

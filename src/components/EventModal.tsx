import React, { useState, useEffect } from 'react';
import { Task, SubTask } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'expanded'>) => void;
  selectedDate: string;
  editingTask?: Task;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B4D9', '#A8E6CF'
];

export default function EventModal({ isOpen, onClose, onSave, selectedDate, editingTask }: EventModalProps) {
  const [name, setName] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTaskName, setNewSubTaskName] = useState('');

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setIsUrgent(editingTask.isUrgent);
      setCategory(editingTask.category);
      setColor(editingTask.color);
      setSubTasks(editingTask.subTasks);
    } else {
      setName('');
      setIsUrgent(false);
      setCategory('');
      setColor(COLORS[0]);
      setSubTasks([]);
      setNewSubTaskName('');
    }
  }, [editingTask, isOpen]);

  const handleAddSubTask = () => {
    if (newSubTaskName.trim()) {
      setSubTasks([...subTasks, {
        id: Date.now().toString(),
        name: newSubTaskName,
        completed: false
      }]);
      setNewSubTaskName('');
    }
  };

  const handleRemoveSubTask = (id: string) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        name,
        isUrgent,
        category,
        color,
        startDate: editingTask?.startDate || selectedDate,
        endDate: editingTask?.endDate || selectedDate,
        subTasks
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
          {editingTask ? '编辑事件' : '添加新事件'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              事件名称 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="输入事件名称"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 500 }}>标记为紧急</span>
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              事件分类
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="例如：工作、学习、生活"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              选择颜色
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: c,
                    cursor: 'pointer',
                    border: color === c ? '3px solid #333' : '2px solid #ddd',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              子任务
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={newSubTaskName}
                onChange={(e) => setNewSubTaskName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubTask())}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
                placeholder="添加子任务"
              />
              <button
                type="button"
                onClick={handleAddSubTask}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#4ECDC4',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                添加
              </button>
            </div>
            {subTasks.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                {subTasks.map(st => (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      marginBottom: '6px'
                    }}
                  >
                    <span style={{ flex: 1, fontSize: '14px' }}>{st.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubTask(st.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#4ECDC4',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  isUrgent: boolean;
  category: string;
  color: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  subTasks: SubTask[];
  expanded: boolean;
}

export interface DayCell {
  date: string; // YYYY-MM-DD
  day: number;
  isCurrentMonth: boolean;
}

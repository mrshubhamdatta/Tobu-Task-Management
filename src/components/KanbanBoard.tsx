import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskEdit?: (task: Task) => void;
  onTaskSelect?: (task: Task) => void;
  onTaskStatusChange?: (task: Task, oldStatus: TaskStatus, newStatus: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard({ tasks, setTasks, onTaskEdit, onTaskSelect, onTaskStatusChange }: KanbanBoardProps) {
  const [columns, setColumns] = useState(COLUMNS);

  
  const [activeColumn, setActiveColumn] = useState<TaskStatus | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [initialTaskStatus, setInitialTaskStatus] = useState<TaskStatus | null>(null);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px drag distance before firing, to allow clicking
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.columnId);
      return;
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
      setInitialTaskStatus(event.active.data.current.task.status);
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          // moving to a different column
          const newTasks = [...tasks];
          newTasks[activeIndex] = {
            ...newTasks[activeIndex],
            status: tasks[overIndex].status,
          };
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Im dropping a Task over an empty Column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          status: overId as TaskStatus,
        };
        return arrayMove(newTasks, activeIndex, activeIndex); // Just triggering a re-render with new status
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (activeTask && activeTask.id) {
      const currentTask = tasks.find(t => t.id === activeTask.id);
      if (currentTask && initialTaskStatus && currentTask.status !== initialTaskStatus) {
        onTaskStatusChange?.(currentTask, initialTaskStatus, currentTask.status);
      }
    }

    setActiveColumn(null);
    setActiveTask(null);
    setInitialTaskStatus(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveColumn = active.data.current?.type === 'Column';
    if (isActiveColumn) {
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
        const overColumnIndex = columns.findIndex((col) => col.id === overId);
        return arrayMove(columns, activeColumnIndex, overColumnIndex);
      });
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleTaskDelete = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete?.assignees && taskToDelete.assignees.length > 0) {
      alert(`Notification: Task "${taskToDelete.title}" was deleted. Email sent to ${taskToDelete.assignees.map(a => a.name).join(', ')}.`);
    } else if (taskToDelete) {
      alert(`Task "${taskToDelete.title}" was deleted.`);
    }
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full items-start">
        <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks.filter((task) => task.status === col.id)}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskEdit={onTaskEdit}
              onTaskSelect={onTaskSelect}
            />
          ))}
        </SortableContext>
      </div>

      {createPortal(
        <DragOverlay>
          {activeColumn && (
            <KanbanColumn
              id={activeColumn}
              title={columns.find(c => c.id === activeColumn)?.title || ''}
              tasks={tasks.filter((task) => task.status === activeColumn)}
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

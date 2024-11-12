// contexts/TaskContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const TaskContext = createContext({});

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const TASK_STATUS = {
  PENDING: 'pending',
  EXPIRED: 'expired',
  COMPLETED: 'completed',
};

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  // Check for expired tasks every minute
  useEffect(() => {
    if (tasks.length > 0) {
      const interval = setInterval(checkExpiredTasks, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [tasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedTasks = await AsyncStorage.getItem(`tasks_${user.id}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(`tasks_${user.id}`, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (err) {
      setError('Failed to save tasks');
      console.error('Error saving tasks:', err);
    }
  };

  const addTask = async (taskData) => {
    try {
      const newTask = {
        id: Date.now().toString(),
        userId: user.id,
        status: TASK_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        ...taskData,
      };

      const newTasks = [...tasks, newTask];
      await saveTasks(newTasks);
      return newTask;
    } catch (err) {
      setError('Failed to add task');
      throw err;
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) throw new Error('Task not found');

      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };

      await saveTasks(updatedTasks);
      return updatedTasks[taskIndex];
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const newTasks = tasks.filter(task => task.id !== taskId);
      await saveTasks(newTasks);
    } catch (err) {
      setError('Failed to delete task');
      throw err;
    }
  };

  const completeTask = async (taskId) => {
    try {
      await updateTask(taskId, {
        status: TASK_STATUS.EXPIRED,
        completedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to complete task');
      throw err;
    }
  };

  const checkExpiredTasks = async () => {
    const now = new Date();
    let hasChanges = false;

    const updatedTasks = tasks.map(task => {
      if (
        task.status === TASK_STATUS.PENDING &&
        new Date(task.expiryTime) <= now
      ) {
        hasChanges = true;
        return {
          ...task,
          status: TASK_STATUS.EXPIRED,
          expiredAt: now.toISOString(),
        };
      }
      return task;
    });

    if (hasChanges) {
      await saveTasks(updatedTasks);
    }
  };

  const getFilteredTasks = (filter) => {
    switch (filter) {
      case 'pending':
        return tasks.filter(task => task.status === TASK_STATUS.PENDING);
      case 'expired':
        return tasks.filter(task => task.status === TASK_STATUS.EXPIRED);
      case 'completed':
        return tasks.filter(task => task.status === TASK_STATUS.COMPLETED);
      case 'high':
        return tasks.filter(task => task.priority === PRIORITY_LEVELS.HIGH);
      case 'medium':
        return tasks.filter(task => task.priority === PRIORITY_LEVELS.MEDIUM);
      case 'low':
        return tasks.filter(task => task.priority === PRIORITY_LEVELS.LOW);
      default:
        return tasks;
    }
  };

  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId);
  };

  const getRemainingTime = (task) => {
    if (task.status !== TASK_STATUS.PENDING) return null;
    
    const now = new Date();
    const expiryTime = new Date(task.expiryTime);
    const difference = expiryTime - now;

    if (difference <= 0) return null;

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      hours,
      minutes,
      seconds,
      total: difference,
    };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        getFilteredTasks,
        getTaskById,
        getRemainingTime,
        PRIORITY_LEVELS,
        TASK_STATUS,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);
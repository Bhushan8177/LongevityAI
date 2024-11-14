// contexts/TaskContext.js
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

const TaskContext = createContext({});

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export const TASK_STATUS = {
  PENDING: "pending",
  EXPIRED: "expired",
  COMPLETED: "completed",
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
      const interval = setInterval(checkExpiredTasks, 60000);
      return () => clearInterval(interval);
    }
  }, [tasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const storedTasks = await AsyncStorage.getItem(`tasks_${user.id}`);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // Update expired status of tasks on load
        const updatedTasks = parsedTasks.map((task) => {
          if (
            task.status === TASK_STATUS.PENDING &&
            new Date(task.expiryTime) <= new Date()
          ) {
            return { ...task, status: TASK_STATUS.EXPIRED };
          }
          return task;
        });
        setTasks(updatedTasks);
        if (parsedTasks.length !== updatedTasks.length) {
          // Save if any tasks were updated
          await saveTasks(updatedTasks);
        }
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(`tasks_${user.id}`, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (err) {
      console.error("Error saving tasks:", err);
      setError("Failed to save tasks");
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
      console.error("Error adding task:", err);
      setError("Failed to add task");
      throw err;
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      const taskIndex = tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) throw new Error("Task not found");

      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };

      await saveTasks(updatedTasks);
      return updatedTasks[taskIndex];
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const newTasks = tasks.filter((task) => task.id !== taskId);
      await saveTasks(newTasks);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
      throw err;
    }
  };

  const completeTask = async (taskId) => {
    try {
      await updateTask(taskId, {
        status: TASK_STATUS.COMPLETED,
        completedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error completing task:", err);
      setError("Failed to complete task");
      throw err;
    }
  };

  const checkExpiredTasks = async () => {
    const now = new Date();
    let hasChanges = false;

    const updatedTasks = tasks.map((task) => {
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
    return tasks.filter((task) => {
      switch (filter) {
        case "pending":
          return task.status === TASK_STATUS.PENDING;
        case "expired":
          return task.status === TASK_STATUS.EXPIRED;
        case "completed":
          return task.status === TASK_STATUS.COMPLETED;
        case "high":
          return task.priority === PRIORITY_LEVELS.HIGH;
        case "medium":
          return task.priority === PRIORITY_LEVELS.MEDIUM;
        case "low":
          return task.priority === PRIORITY_LEVELS.LOW;
        default:
          return true;
      }
    });
  };

  const getTaskById = (taskId) => {
    return tasks.find((task) => task.id === taskId);
  };

  const clearAllTasks = async () => {
    try {
      await AsyncStorage.removeItem(`tasks_${user.id}`);
      setTasks([]);
    } catch (err) {
      console.error("Error clearing tasks:", err);
      setError("Failed to clear tasks");
      throw err;
    }
  };

  // For debugging
  const _debugPrintTasks = async () => {
    const allData = await AsyncStorage.getAllKeys();
    console.log("All AsyncStorage Keys:", allData);
    const taskData = await AsyncStorage.getItem(`tasks_${user.id}`);
    console.log("Current Tasks:", taskData);
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
        clearAllTasks,
        _debugPrintTasks, // Remove in production
        PRIORITY_LEVELS,
        TASK_STATUS,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);

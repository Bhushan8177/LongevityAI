// app/(app)/home.js
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Button,
  Portal,
  Dialog,
  FAB,
  Searchbar,
} from "react-native-paper";
import { router } from "expo-router";
import { useTasks } from "../contexts/TaskContext";
import { useAuth } from "../contexts/AuthContext";
import { TaskCard } from "../components/tasks/TaskCard";
import { TaskFilters } from "../app/tasks/taskfilters";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { ConfirmationDialog } from "../components/common/ConfirmationDialogue";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { getFilteredTasks, loading, deleteTask, completeTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [deleteDialogConfig, setDeleteDialogConfig] = useState({
    visible: false,
    taskId: null,
    loading: false,
  });

  const [warningDialogConfig, setWarningDialogConfig] = useState({
    visible: false,
    task: null,
    loading: false,
  });

  const handlePress = (task) => {
    if (task.status === "expired") {
      setWarningDialogConfig({
        visible: true,
        loading: false,
      });
    } else {
      router.push(`/tasks/${task.id}`);
    }
  };


  // Filter and search tasks
  useEffect(() => {
    const tasks = getFilteredTasks(activeFilter).filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort tasks - pending and closest to expiry first
    const sortedTasks = tasks.sort((a, b) => {
      // First sort by status
      if (a.status !== b.status) {
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
      }
      // Then by expiry time for pending tasks
      if (a.status === 'pending' && b.status === 'pending') {
        return new Date(a.expiryTime) - new Date(b.expiryTime);
      }
      // For non-pending tasks, show most recent first
      return new Date(b.expiryTime) - new Date(a.expiryTime);
    });

    setFilteredTasks(sortedTasks);
  }, [activeFilter, searchQuery, getFilteredTasks]);

  const handleDeletePress = (taskId) => {
    setDeleteDialogConfig({
      visible: true,
      taskId,
      loading: false,
    });
  };

  const handleConfirmWarningDialog = () => {
    setWarningDialogConfig({
      visible: false,
      task: null,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteDialogConfig((prev) => ({ ...prev, loading: true }));
      await deleteTask(deleteDialogConfig.taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setDeleteDialogConfig({
        visible: false,
        taskId: null,
        loading: false,
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogConfig({
      visible: false,
      taskId: null,
      loading: false,
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">Welcome, {user?.email}</Text>
        <Button mode="text" onPress={signOut}>
          Logout
        </Button>
      </View>

      <Searchbar
        placeholder="Search tasks..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Task Filters */}
      <TaskFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Task List */}
      <ScrollView style={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge">No tasks found</Text>
            <Button
              mode="contained"
              onPress={() => router.push("/tasks/create")}
              style={styles.createButton}
            >
              Create your first task
            </Button>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={handlePress}
              onComplete={() => completeTask(task.id)}
              onDelete={() => handleDeletePress(task.id)}
            />
          ))
        )}

        <ConfirmationDialog
          visible={deleteDialogConfig.visible}
          onDismiss={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="#FF3B30"
          loading={deleteDialogConfig.loading}
          type="delete"
        />

        <ConfirmationDialog
          visible={warningDialogConfig.visible}
          //   onDismiss={setWarningDialogConfig({
          //     visible: false,
          //     task: null,
          //     loading: false,
          //   })}
          onConfirm={handleConfirmWarningDialog}
          title="Task Expired"
          message="This task has expired. You cannot update it."
          confirmText="Continue"
          confirmColor="#FF9500"
          loading={warningDialogConfig.loading}
          type="warning"
        />
      </ScrollView>

      {/* FAB for creating new task */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/tasks/create")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  searchBar: {
    margin: 16,
    elevation: 0,
    backgroundColor: "#fff",
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  createButton: {
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#007AFF",
  },
});

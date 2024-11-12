import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Button,
  FAB,
  Searchbar,
  SegmentedButtons,
  Portal,
  Dialog,
} from "react-native-paper";
import { router } from "expo-router";
import { useTasks } from "../contexts/TaskContext";
import { useAuth } from "../contexts/AuthContext";
import { TaskCard } from "../components/tasks/TaskCard";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { ConfirmationDialog } from "../components/common/ConfirmationDialogue";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { getFilteredTasks, loading } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const { deleteTask, completeTask } = useTasks();
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

  useEffect(() => {
    const filteredTasks = getFilteredTasks(filter)
      .filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // First, separate tasks by status
        if (a.status !== b.status) {
          // Pending tasks come first
          if (a.status === "pending") return -1;
          if (b.status === "pending") return 1;
          // Expired tasks come second
          if (a.status === "expired") return -1;
          if (b.status === "expired") return 1;
        }

        // For tasks with the same status, sort by expiry time
        const aExpiry = new Date(a.expiryTime).getTime();
        const bExpiry = new Date(b.expiryTime).getTime();

        // Sort pending tasks by earliest deadline first
        if (a.status === "pending") {
          return aExpiry - bExpiry;
        }

        // Sort expired and completed tasks by most recent first
        return bExpiry - aExpiry;
      });

    setTasks(filteredTasks);
  }, [filter, searchQuery, getFilteredTasks]);
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleSmall" style={styles.greeting}>
          Welcome, {user?.email}
        </Text>
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

      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "expired", label: "Expired" },
        ]}
        style={styles.filterButtons}
      />

      <ScrollView style={styles.taskList}>
        {tasks.length === 0 ? (
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
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              //   onPress={() => router.push(`/tasks/${task.id}`)}
              onPress={() => handlePress(task)}
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
  },
  greeting: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 0,
  },
  filterButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
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
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

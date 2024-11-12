// app/(app)/tasks/[id].js
import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  IconButton,
  Portal,
  Dialog,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useTasks } from "../../contexts/TaskContext";
import { DateTimePickerButton } from "../../components/common/DateTimePickerButton";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialogue";

export default function UpdateTaskScreen() {
  const { id } = useLocalSearchParams();
  const { updateTask, deleteTask, getTaskById, PRIORITY_LEVELS } = useTasks();
  const [warningDialogConfig, setWarningDialogConfig] = useState({
    visible: false,
    taskId: null,
    loading: false,
  });

  // Original task data
  const [originalTask, setOriginalTask] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(PRIORITY_LEVELS.MEDIUM);
  const [expiryDate, setExpiryDate] = useState(new Date());

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load task data
  useEffect(() => {
    const task = getTaskById(id);
    if (task) {
      setOriginalTask(task);
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setExpiryDate(new Date(task.expiryTime));
    } else {
      setError("Task not found");
      router.back();
    }
  }, [id]);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    if (!originalTask) return false;

    return (
      title !== originalTask.title ||
      description !== (originalTask.description || "") ||
      priority !== originalTask.priority ||
      new Date(expiryDate).getTime() !==
        new Date(originalTask.expiryTime).getTime()
    );
  }, [originalTask, title, description, priority, expiryDate]);

  // Validation check
  const isValid = useMemo(() => {
    return (
      title.trim().length > 0 &&
      (expiryDate > new Date() || originalTask?.status !== "pending")
    );
  }, [title, expiryDate, originalTask]);

  const handleUpdate = async () => {
    if (!isValid) {
      setError("Please check all fields");
      return;
    }

    try {
      setLoading(true);
      await updateTask(id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        expiryTime: expiryDate.toISOString(),
      });
      router.back();
    } catch (err) {
      setError("Failed to update task");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteTask(id);
      router.back();
    } catch (err) {
      setError("Failed to delete task");
      setLoading(false);
    }
  };

  if (!originalTask) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall">Update Task</Text>
        <IconButton
          icon="delete"
          mode="contained"
          containerColor="#FF3B30"
          iconColor="#fff"
          onPress={() => setShowDeleteDialog(true)}
        />
      </View>

      <TextInput
        label="Task Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
        error={title.trim().length === 0}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Text variant="bodyMedium" style={styles.label}>
        Priority
      </Text>
      <View style={styles.priorityContainer}>
        <SegmentedButtons
          value={priority}
          onValueChange={setPriority}
          buttons={[
            { value: PRIORITY_LEVELS.LOW, label: "Low" },
            { value: PRIORITY_LEVELS.MEDIUM, label: "Medium" },
            { value: PRIORITY_LEVELS.HIGH, label: "High" },
          ]}
        />
      </View>

      <Text variant="bodyMedium" style={styles.label}>
        Due Date & Time
      </Text>
      <View style={styles.dateContainer}>
        <DateTimePickerButton
          value={expiryDate}
          onChange={(date) => setExpiryDate(date)}
          minimumDate={
            originalTask.status === "pending" ? new Date() : undefined
          }
        />
        {originalTask.status === "pending" && expiryDate <= new Date() && (
          <Text style={styles.dateError}>
            Due date must be in the future for pending tasks
          </Text>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={[styles.button, styles.cancelButton]}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={loading}
          disabled={loading || !hasChanges || !isValid}
          style={[styles.button, styles.updateButton]}
        >
          {hasChanges ? "Update Task" : "No Changes"}
        </Button>
      </View>

      {/* Status indicator */}
      {hasChanges && (
        <Text style={styles.changeIndicator}>You have unsaved changes</Text>
      )}

      <ConfirmationDialog
        visible={warningDialogConfig.visible}
        onDismiss={warningDialogConfig.visible = false}
        // onConfirm={handleConfirmWarning}
        title="Task Expired"
        message="This task has expired. You cannot update it."
        // confirmText="Extend"
        confirmColor="#FF9500"
        cancelText="Delete"
        loading={warningDialogConfig.loading}
        type="warning"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
    color: "#666",
  },
  priorityContainer: {
    marginBottom: 24,
  },
  dateContainer: {
    marginBottom: 24,
  },
  dateError: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: "#8E8E93",
  },
  updateButton: {
    backgroundColor: "#007AFF",
  },
  error: {
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  changeIndicator: {
    color: "#FF9500",
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
  },
});

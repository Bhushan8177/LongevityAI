// app/(app)/tasks/create.js
import { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, SegmentedButtons, Text } from "react-native-paper";
import { router } from "expo-router";
import { useTasks } from "../../contexts/TaskContext";
import { DateTimePickerButton } from "../../components/common/DateTimePickerButton";

export default function CreateTaskScreen() {
  const { addTask, PRIORITY_LEVELS } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(PRIORITY_LEVELS.MEDIUM);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    date: false
  });

  // Validation function
  const getErrors = useMemo(() => {
    const errors = {};

    if (touched.title && !title.trim()) {
      errors.title = "Title is required";
    }

    if (touched.description && !description.trim()) {
      errors.description = "Description is required";
    }

    if (touched.date && expiryDate <= new Date()) {
      errors.date = "Expiry time must be in the future";
    }

    return errors;
  }, [title, description, expiryDate, touched]);

  // Form validity check
  const isValid = useMemo(() => {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      expiryDate > new Date() &&
      !loading
    );
  }, [title, description, expiryDate, loading]);

  const handleCreateTask = async () => {
    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      date: true
    });

    if (!isValid) return;

    try {
      setLoading(true);
      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        expiryTime: expiryDate.toISOString(),
      });
      router.back();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          label="Task Title"
          value={title}
          onChangeText={setTitle}
          onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
          mode="outlined"
          error={touched.title && getErrors.title}
          style={styles.input}
        />
        {touched.title && getErrors.title && (
          <Text style={styles.errorText}>{getErrors.title}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
          mode="outlined"
          multiline
          numberOfLines={4}
          error={touched.description && getErrors.description}
          style={styles.input}
        />
        {touched.description && getErrors.description && (
          <Text style={styles.errorText}>{getErrors.description}</Text>
        )}
      </View>

      <Text variant="bodyMedium" style={styles.label}>
        Priority
      </Text>
      <View style={styles.priorityContainer}>
        <SegmentedButtons
          value={priority}
          onValueChange={setPriority}
          buttons={[
            { 
              value: PRIORITY_LEVELS.LOW, 
              label: "Low",
              checkedColor: "#34C759" 
            },
            { 
              value: PRIORITY_LEVELS.MEDIUM, 
              label: "Medium",
              checkedColor: "#FF9500"
            },
            { 
              value: PRIORITY_LEVELS.HIGH, 
              label: "High",
              checkedColor: "#FF3B30"
            },
          ]}
        />
      </View>

      <Text variant="bodyMedium" style={styles.label}>
        Due Date & Time
      </Text>
      <View style={styles.inputContainer}>
        <DateTimePickerButton
          value={expiryDate}
          onChange={(date) => {
            setExpiryDate(date);
            setTouched(prev => ({ ...prev, date: true }));
          }}
          minimumDate={new Date()}
        />
        {touched.date && getErrors.date && (
          <Text style={styles.errorText}>{getErrors.date}</Text>
        )}
      </View>

      <Button
        mode="contained"
        onPress={handleCreateTask}
        loading={loading}
        disabled={!isValid || loading}
        style={[
          styles.button,
          !isValid && styles.buttonDisabled
        ]}
      >
        Create Task
      </Button>

      {!isValid && touched.title && touched.description && touched.date && (
        <Text style={styles.helperText}>
          Please fill in all required fields and set a future date
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F2F7",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
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
  button: {
    marginVertical: 16,
    backgroundColor: "#007AFF",
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.7,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
// components/common/ConfirmationDialog.js
import { View, StyleSheet } from "react-native";
import { Dialog, Portal, Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function ConfirmationDialog({
  visible,
  onDismiss,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmColor = "#FF3B30",
  cancelText = null, 
  loading = false,
  type = "delete",
}) {
  const getIcon = () => {
    switch (type) {
      case "delete":
        return {
          name: "alert-circle-outline",
          color: "#FF3B30",
          backgroundColor: "#FFE5E5",
        };
      case "complete":
        return {
          name: "check-circle-outline",
          color: "#34C759",
          backgroundColor: "#E8F8EF",
        };
      case "warning":
        return {
          name: "alert-outline",
          color: "#FF9500",
          backgroundColor: "#FFF4E5",
        };
      default:
        return {
          name: "information-outline",
          color: "#007AFF",
          backgroundColor: "#E5F0FF",
        };
    }
  };

  const icon = getIcon();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconBackground,
              { backgroundColor: icon.backgroundColor },
            ]}
          >
            <MaterialCommunityIcons
              name={icon.name}
              size={32}
              color={icon.color}
            />
          </View>
        </View>

        <Dialog.Title style={styles.title}>{title}</Dialog.Title>

        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        </Dialog.Content>

        <Dialog.Actions style={[
          styles.actions,
          !cancelText && styles.singleButtonActions
        ]}>
          {cancelText && (
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[
                styles.button,
                styles.cancelButton
              ]}
              labelStyle={styles.cancelButtonText}
            >
              {cancelText}
            </Button>
          )}
          <Button
            mode="contained"
            onPress={onConfirm}
            style={[
              styles.button,
              !cancelText && styles.singleButton,
              { backgroundColor: loading ? "#999" : confirmColor },
            ]}
            labelStyle={styles.confirmButtonText}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 28,
    marginHorizontal: 24,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
    color: "#000",
  },
  message: {
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    marginTop: 8,
  },
  actions: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  singleButtonActions: {
    paddingHorizontal: 48, // Wider padding for single button
  },
  button: {
    flex: 1,
    minWidth: 120, // Ensure minimum width for buttons
  },
  singleButton: {
    flex: 0, // Don't expand to full width
    paddingHorizontal: 32, // Add some padding
  },
  cancelButton: {
    borderColor: "#D1D1D6",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

// Usage examples:
// Double button dialog
{/* <ConfirmationDialog
  visible={deleteDialogConfig.visible}
  onDismiss={handleCancelDelete}
  onConfirm={handleConfirmDelete}
  title="Delete Task"
  message="Are you sure you want to delete this task? This action cannot be undone."
  confirmText="Delete"
  confirmColor="#FF3B30"
  cancelText="Cancel"
  loading={deleteDialogConfig.loading}
  type="delete"
/>

// Single button dialog (information/success)
<ConfirmationDialog
  visible={successDialogVisible}
  onDismiss={handleDismiss}
  onConfirm={handleDismiss}
  title="Task Completed"
  message="Great job! The task has been marked as complete."
  confirmText="OK"
  confirmColor="#34C759"
  type="complete"
/> */}
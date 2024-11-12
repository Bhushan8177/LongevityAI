// app/_layout.js
import { useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../contexts/AuthContext";
import { TaskProvider } from "../contexts/TaskContext";
import { theme } from "../utils/theme";

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <TaskProvider>
          <Stack
            screenOptions={{
              textAlign: "center",
              title: "Task Manager",
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
        </TaskProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

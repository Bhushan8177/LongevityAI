// components/common/DateTimePickerButton.js
import { useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

export function DateTimePickerButton({ value, onChange, minimumDate }) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  const [pickerMode, setPickerMode] = useState("date");

  const handlePress = () => {
    setShowPicker(true);
    setPickerMode("date");
    setTempDate(value);
  };

  const handleChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;

    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set") {
        if (pickerMode === "date") {
          // Save the date part and maintain the existing time
          const newDate = new Date(currentDate);
          const existingTime = new Date(tempDate);
          newDate.setHours(existingTime.getHours());
          newDate.setMinutes(existingTime.getMinutes());
          setTempDate(newDate);

          // Show time picker after date selection
          setTimeout(() => {
            setPickerMode("time");
            setShowPicker(true);
          }, 100);
        } else {
          // For time selection, maintain the selected date and update time
          const finalDate = new Date(tempDate);
          finalDate.setHours(currentDate.getHours());
          finalDate.setMinutes(currentDate.getMinutes());
          setTempDate(finalDate);
          onChange(finalDate);
        }
      }
    } else {
      // iOS handling
      setTempDate(currentDate);
    }
  };

  const handleIOSConfirm = () => {
    if (pickerMode === "date") {
      // Switch to time picker after date selection
      setPickerMode("time");
    } else {
      // When time is selected, complete the selection
      setShowPicker(false);
      onChange(tempDate);
    }
  };

  const handleIOSCancel = () => {
    if (pickerMode === "time") {
      // Go back to date selection if cancelling time
      setPickerMode("date");
      setTempDate(value);
    } else {
      // Close picker if cancelling date
      setShowPicker(false);
      setTempDate(value);
    }
  };

  return (
    <View>
      <Button mode="outlined" onPress={handlePress} style={styles.button}>
        {format(value, "PPP p")}
      </Button>

      {showPicker && (
        <View style={styles.pickerContainer}>
          {Platform.OS === "ios" && (
            <View style={styles.iosButtons}>
              <Button onPress={handleIOSCancel} textColor="#FF3B30">
                {pickerMode === "date" ? "Cancel" : "Back"}
              </Button>
              <Text style={styles.pickerTitle}>
                {pickerMode === "date" ? "Select Date" : "Select Time"}
              </Text>
              <Button onPress={handleIOSConfirm} textColor="#007AFF">
                {pickerMode === "date" ? "Next" : "Confirm"}
              </Button>
            </View>
          )}
          <DateTimePicker
            value={tempDate}
            mode={pickerMode}
            is24Hour={false}
            minimumDate={minimumDate}
            onChange={handleChange}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            textColor="#000000"
            themeVariant="light"
            style={styles.picker}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }),
  },
  iosButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  picker: {
    height: 200,
    backgroundColor: "#FFFFFF",
  },
});

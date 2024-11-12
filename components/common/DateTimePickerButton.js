// components/common/DateTimePickerButton.js
import { useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export function DateTimePickerButton({ value, onChange, minimumDate }) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  const [pickerMode, setPickerMode] = useState('date');

  const handlePress = () => {
    setShowPicker(true);
    setPickerMode('date');
  };

  const handleChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;

    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set') {
        if (pickerMode === 'date') {
          // Save the date part and maintain the existing time
          const newDate = new Date(currentDate);
          const existingTime = new Date(tempDate);
          newDate.setHours(existingTime.getHours());
          newDate.setMinutes(existingTime.getMinutes());
          setTempDate(newDate);
          
          // Show time picker after date selection
          setTimeout(() => {
            setPickerMode('time');
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
    setShowPicker(false);
    onChange(tempDate);
  };

  const handleIOSCancel = () => {
    setShowPicker(false);
    setTempDate(value);
  };

  return (
    <View>
      <Button 
        mode="outlined" 
        onPress={handlePress}
        style={styles.button}
      >
        {format(value, 'PPP p')}
      </Button>

      {showPicker && (
        <View>
          {Platform.OS === 'ios' && (
            <View style={styles.iosButtons}>
              <Button onPress={handleIOSCancel}>Cancel</Button>
              <Button onPress={handleIOSConfirm}>
                {pickerMode === 'date' ? 'Next' : 'Confirm'}
              </Button>
            </View>
          )}
          <DateTimePicker
            value={Platform.OS === 'ios' ? tempDate : tempDate}
            mode={pickerMode}
            is24Hour={true}
            minimumDate={minimumDate}
            onChange={handleChange}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
  iosButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
});
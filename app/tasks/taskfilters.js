// components/tasks/TaskFilters.js
import { View, StyleSheet, ScrollView } from "react-native";
import { Chip, useTheme } from 'react-native-paper';

export function TaskFilters({ activeFilter, onFilterChange }) {
  const theme = useTheme();

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'expired', label: 'Expired' },
    { id: 'completed', label: 'Completed' },
    { id: 'high', label: 'High Priority' },
    { id: 'medium', label: 'Medium Priority' },
    { id: 'low', label: 'Low Priority' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            selected={activeFilter === filter.id}
            onPress={() => onFilterChange(filter.id)}
            style={[
              styles.chip,
              activeFilter === filter.id && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            textStyle={[
              styles.chipText,
              activeFilter === filter.id && styles.selectedChipText,
            ]}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
  },
  selectedChipText: {
    color: '#fff',
  },
});
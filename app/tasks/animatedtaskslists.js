// components/tasks/AnimatedTaskList.js
import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { TaskCard } from '../../components/tasks/TaskCard';

export function AnimatedTaskList({ tasks, onPress, onComplete, onDelete }) {
  const animatedValues = tasks.map(() => new Animated.Value(0));

  React.useEffect(() => {
    const animations = tasks.map((_, index) =>
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, [tasks]);

  return tasks.map((task, index) => (
    <Animated.View
      key={task.id}
      style={[
        styles.taskContainer,
        {
          opacity: animatedValues[index],
          transform: [
            {
              translateY: animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TaskCard
        task={task}
        onPress={() => onPress(task)}
        onComplete={() => onComplete(task.id)}
        onDelete={() => onDelete(task.id)}
      />
    </Animated.View>
  ));
}

const styles = StyleSheet.create({
  taskContainer: {
    marginBottom: 12,
  },
});
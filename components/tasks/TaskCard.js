import { View, StyleSheet, Pressable } from "react-native";
import { Text, Card, IconButton, Surface } from "react-native-paper";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useTasks } from "../../contexts/TaskContext";

export function TaskCard({ task, onPress, onComplete, onDelete }) {
  const { PRIORITY_LEVELS, TASK_STATUS } = useTasks();
  const [timeLeft, setTimeLeft] = useState({ primary: '', secondary: null });


  const getPriorityColor = () => {
    switch (task.priority) {
      case PRIORITY_LEVELS.HIGH:
        return "#FF3B30";
      case PRIORITY_LEVELS.MEDIUM:
        return "#FF9500";
      default:
        return "#34C759";
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case TASK_STATUS.COMPLETED:
        return "#34C759";
      case TASK_STATUS.EXPIRED:
        return "#FF3B30";
      default:
        return "#007AFF";
    }
  };


  useEffect(() => {
    let interval;
    if (task.status === TASK_STATUS.PENDING) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiryTime = new Date(task.expiryTime).getTime();
        const difference = expiryTime - now;
  
        if (difference <= 0) {
          setTimeLeft({ primary: 'EXPIRED', secondary: null });
          clearInterval(interval);
          return;
        }
  
        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
        // Format display string
        if (days >= 1) {
          setTimeLeft({
            primary: `${days} ${days === 1 ? 'day' : 'days'}`,
            secondary: `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          });
        } else {
          setTimeLeft({
            primary: `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            secondary: null
          });
        }
      }, 1000);
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task]);

  // Handle the press event with ripple effect
  const handlePress = () => {
    if (onPress) {
      onPress(task);
    }
  };

  const getTimeLeftColor = () => {
    if (task.status !== TASK_STATUS.PENDING) return '#8E8E93';
    
    const difference = new Date(task.expiryTime).getTime() - new Date().getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    
    if (days >= 3) return '#34C759'; // Green for 3+ days
    if (days >= 2) return '#007AFF'; // Blue for 2+ days
    if (days >= 1) return '#FF9500'; // Orange for 1+ day
    return '#FF3B30'; // Red for less than 1 day
  };

  return (
    <Surface style={styles.surface} elevation={1}>
      <Card style={styles.card} mode="elevated">
        <Pressable
          onPress={handlePress}
          android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
          style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        >
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: getPriorityColor() },
                  ]}
                />
                <Text variant="titleMedium" style={styles.title}>
                  {task.title}
                </Text>
              </View>
              <View style={styles.actions}>
                {task.status === TASK_STATUS.PENDING && (
                  <IconButton
                    icon="check-circle"
                    iconColor="#34C759"
                    size={24}
                    onPress={(e) => {
                      e.stopPropagation();
                      onComplete?.(task);
                    }}
                  />
                )}
                <IconButton
                  icon="delete"
                  iconColor="#FF3B30"
                  size={24}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete?.(task);
                  }}
                />
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.description}>
              {task.description}
            </Text>

            <View style={styles.footer}>
              <View style={styles.footerLeft}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor() },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {task.status.toUpperCase()}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.dueDate}>
                  Due: {format(new Date(task.expiryTime), "MMM d, h:mm a")}
                </Text>
              </View>

              {task.status === TASK_STATUS.PENDING && (
                <View style={styles.countdown}>
                  <Text variant="bodySmall" style={styles.countdownLabel}>
                    Time Left:
                  </Text>
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.countdownTime,
                      { color: getTimeLeftColor() },
                    ]}
                  >
                    {timeLeft.primary}
                  </Text>
                  {timeLeft.secondary && (
                    <Text variant="bodySmall" style={styles.secondaryTime}>
                      {timeLeft.secondary}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Card.Content>
        </Pressable>
      </Card>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingBottom: 5,
  },
  pressable: {
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  priorityIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    marginRight: -8,
  },
  description: {
    marginBottom: 16,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flexDirection: "column",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  dueDate: {
    color: "#666",
  },
  countdown: {
    alignItems: 'flex-end',
  },
  countdownLabel: {
    color: '#666',
    marginBottom: 4,
  },
  countdownTime: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  secondaryTime: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },

});

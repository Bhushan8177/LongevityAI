// app/(auth)/login.js
import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    setError('');
    
    // Validation
    if (!email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      router.replace('/home');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        error={error && !validateEmail(email)}
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        error={error && password.length < 6}
        style={styles.input}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Login
      </Button>

      <Link href="/signup" asChild>
        <Button mode="text">Don't have an account? Sign Up</Button>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
});
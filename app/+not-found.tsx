import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF6B57" />
          <Text style={styles.title}>This screen doesn't exist.</Text>
          <Text style={styles.subtitle}>
            The page you're looking for cannot be found.
          </Text>
          <Link href="/(tabs)" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Go to Home</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#FF6B57',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

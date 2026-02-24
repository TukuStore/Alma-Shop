/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays fallback UI instead of crashing the entire app
 */

import { Colors, Elevation } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Functional wrapper with hooks for easier usage
import { useEffect, useState } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Sentry.captureException(error, { errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={64} color={Colors.error} />
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>

            <Text style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>

            <Text style={styles.description}>
              We're sorry for the inconvenience. Please try again or contact support if the problem persists.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                // Go back to home screen
                if (typeof window !== 'undefined' && window.location) {
                  window.location.reload();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Go to Home</Text>
            </TouchableOpacity>

            {/* Error Details (for development) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details:</Text>
                <Text style={styles.errorDetailsText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export function useErrorHandler(error: Error | null) {
  const [errorState, setErrorState] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      setErrorState(error);
    }
  }, [error]);

  const reset = () => setErrorState(null);

  return { error: errorState, reset };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.DEFAULT,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    ...Elevation.md,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 14,
  },
  secondaryButtonText: {
    color: Colors.primary.DEFAULT,
    fontSize: 16,
    fontWeight: '500',
  },
  errorDetails: {
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    width: '100%',
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.DEFAULT,
    marginBottom: 8,
  },
  errorDetailsText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: 'monospace',
  },
});

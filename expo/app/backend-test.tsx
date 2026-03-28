import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BackendTest() {
  return (
    <SafeAreaView style={styles.container} testID="backend-test-screen">
      <View style={styles.content}>
        <Text style={styles.title}>Backend Disabled</Text>
        <Text style={styles.subtitle}>
          Tento build má vypnutý backend. Síťové volání a tRPC nejsou k dispozici.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center' as const,
    marginBottom: 30,
    color: '#666',
  },
});
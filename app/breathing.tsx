import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play, Pause, Wind } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BreathingScreen() {
  const insets = useSafeAreaInsets();
  const [running, setRunning] = useState<boolean>(false);
  const [remaining, setRemaining] = useState<number>(180);
  const scale = useRef(new Animated.Value(1)).current;

  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tenSecBreath = useMemo(() => ({ up: 8000, down: 8000 }), []);

  const startAnimation = () => {
    console.log('[breathing] startAnimation');
    const seq = Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: tenSecBreath.up,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: tenSecBreath.down,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]);
    loopRef.current = Animated.loop(seq, { iterations: -1 });
    loopRef.current.start(() => {});
  };

  const stopAnimation = () => {
    console.log('[breathing] stopAnimation');
    try {
      loopRef.current?.stop();
    } catch (e) {
      console.log('[breathing] stopAnimation error', e);
    }
    scale.stopAnimation(() => {
      scale.setValue(1);
    });
  };

  const startTimer = () => {
    console.log('[breathing] startTimer');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          console.log('[breathing] timer finished');
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setRunning(false);
          stopAnimation();
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const stopTimer = () => {
    console.log('[breathing] stopTimer');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const toggle = () => {
    console.log('[breathing] toggle', { running, remaining });
    if (running) {
      setRunning(false);
      stopTimer();
      stopAnimation();
      return;
    }
    if (remaining <= 0) setRemaining(180);
    setRunning(true);
    startAnimation();
    startTimer();
  };

  useEffect(() => {
    console.log('[breathing] mount');
    return () => {
      console.log('[breathing] unmount cleanup');
      stopTimer();
      stopAnimation();
    };
  }, []);

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <LinearGradient colors={['#F0FDF4', '#E8F5E8']} style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          testID="breathing-back"
          accessibilityRole="button"
          accessibilityLabel="Zpět"
        >
          <ArrowLeft color="#4A9B4A" size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Dechová cvičení</Text>
        <Text style={styles.subtitle}>Uklidněte své tělo a zbavte se stresu</Text>

        <Text style={styles.timer} testID="breathing-timer">{mm}:{ss}</Text>

        <View style={styles.centerWrap}>
          <Animated.View style={[styles.breathBubble, { transform: [{ scale }] }]}
            testID="breathing-bubble"
          >
            <Wind color="#10B981" size={56} />
          </Animated.View>
        </View>

        <TouchableOpacity
          style={[styles.playButton, running ? styles.playButtonActive : null]}
          onPress={toggle}
          testID="breathing-toggle"
          accessibilityRole="button"
          accessibilityLabel={running ? 'Pozastavit cvičení' : 'Spustit cvičení'}
        >
          {running ? <Pause color="#FFFFFF" size={24} /> : <Play color="#FFFFFF" size={24} />}
        </TouchableOpacity>

        <Text style={styles.helper}>Dýchejte z hluboka. Nádech nosem a výdech ústy.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  timer: {
    alignSelf: 'center',
    fontSize: 32,
    fontWeight: '600',
    color: '#14532D',
    marginTop: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5A2D',
    marginTop: 4,
    marginBottom: 6,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  breathBubble: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  playButton: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#EF4444',
  },
  helper: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Music, ArrowLeft } from 'lucide-react-native';
import { Audio, AVPlaybackStatusSuccess, AVPlaybackStatus } from 'expo-av';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';

interface MusicSession {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
}

export default function MusicScreen() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const insets = useSafeAreaInsets();
  const { state } = useApp();

  const musicSessions: MusicSession[] = useMemo(() => [
    {
      id: 'music1',
      title: 'Relaxační hudba',
      description: 'Klidné tóny pro meditaci',
      duration: '30 min',
      icon: <Music color="#10B981" size={24} />,
    },
    {
      id: 'music2',
      title: 'Zvuky přírody',
      description: 'Dešť, příroda a klid',
      duration: '30 min',
      icon: <Music color="#10B981" size={24} />,
    },
    {
      id: 'music3',
      title: 'Klavírní melodie',
      description: 'Jemné klavírní skladby',
      duration: '30 min',
      icon: <Music color="#10B981" size={24} />,
    },
  ], []);

  const sources: Record<string, string> = useMemo(() => ({
    music1: 'https://www.bintigroup.com/app/peaceofmind/mp3/meditation.mp3',
    music2: 'https://www.bintigroup.com/app/peaceofmind/mp3/rain.mp3',
    music3: 'https://www.bintigroup.com/app/peaceofmind/mp3/piano.mp3',
  }), []);

  useEffect(() => {
    const setup = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
          interruptionModeAndroid: 1,
          interruptionModeIOS: 1,
        });
      } catch (e) {
        console.log('[Music] setAudioMode error', e);
      }
    };
    setup();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(err => console.log('[Music] unload error', err));
        soundRef.current = null;
      }
    };
  }, []);



  const stopCurrent = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (e) {
        console.log('[Music] stop error', e);
      }
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.log('[Music] unload error', e);
      }
      soundRef.current = null;
    }
  }, []);

  const handlePlayPause = useCallback(async (sessionId: string) => {
    console.log('[Music] handlePlayPause', { sessionId, playingId });
    if (playingId === sessionId && soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if ((status as AVPlaybackStatusSuccess).isLoaded && (status as AVPlaybackStatusSuccess).isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          Alert.alert('Pozastaveno', 'Hudba byla pozastavena');
          return;
        } else if ((status as AVPlaybackStatusSuccess).isLoaded) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          return;
        }
      } catch (e) {
        console.log('[Music] toggle error', e);
      }
    }

    await stopCurrent();

    const url = sources[sessionId];
    if (!url) {
      Alert.alert('Chyba', 'Nepodařilo se najít zdroj hudby.');
      return;
    }

    try {
      const onStatusUpdate = (status: AVPlaybackStatus) => {
        const s = status as AVPlaybackStatusSuccess;
        if ('isLoaded' in s && s.isLoaded) {
          setIsPlaying(s.isPlaying ?? false);
          if (s.didJustFinish) {
            setPlayingId(null);
            setIsPlaying(false);
          }
        }
      };
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: 1.0 },
        onStatusUpdate
      );
      soundRef.current = sound;
      setPlayingId(sessionId);
      const session = musicSessions.find(s => s.id === sessionId);
      Alert.alert('Přehrává se', `Spuštěna hudba: ${session?.title ?? ''}`);
    } catch (e) {
      console.log('[Music] play error', e);
      Alert.alert('Chyba přehrávání', 'Nepodařilo se spustit hudbu.');
    }
  }, [musicSessions, playingId, sources, stopCurrent]);

  const renderSession = useCallback((session: MusicSession) => (
    <View key={session.id} style={styles.sessionCard} testID={`music-session-${session.id}`}>
      <View style={styles.sessionIcon}>{session.icon}</View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionDescription}>{session.description}</Text>
        <Text style={styles.sessionDuration}>{session.duration}</Text>
      </View>
      <TouchableOpacity
        style={[styles.playButton, playingId === session.id && isPlaying ? styles.playButtonActive : null]}
        onPress={() => void handlePlayPause(session.id)}
        testID={`play-button-${session.id}`}
        accessibilityRole="button"
        accessibilityLabel={playingId === session.id && isPlaying ? 'Pozastavit' : 'Přehrát'}
      >
        {playingId === session.id && isPlaying ? (
          <Pause color="white" size={20} />
        ) : (
          <Play color="white" size={20} />
        )}
      </TouchableOpacity>
    </View>
  ), [handlePlayPause, isPlaying, playingId]);

  return (
    <LinearGradient colors={['#F0FDF4', '#E8F5E8']} style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
          accessibilityRole="button"
          accessibilityLabel="Zpět"
        >
          <ArrowLeft color="#4A9B4A" size={24} />
        </TouchableOpacity>
        <Text style={styles.title} testID="music-title">Hudba</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.catListening}>
            <Text style={styles.catEmoji} testID="music-emoji">
              {playingId && isPlaying ? '🧘‍♀️' : '🐱'}
            </Text>
            <Text style={styles.catText} testID="music-status">
              {playingId && isPlaying ? `${state.petName || 'Míru'} si užívá hudbu s vámi` : `${state.petName || 'Míru'} čeká na relaxační hudbu`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 Relaxační skladby</Text>
            <Text style={styles.sectionDescription}>Klidné tóny pro relaxaci a uklidnění mysli</Text>
            {musicSessions.map(renderSession)}
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5A2D',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'left',
  },
  catListening: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 20,
    borderRadius: 20,
  },
  catEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  catText: {
    fontSize: 16,
    color: '#2D5A2D',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#EF4444',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
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
  scrollView: {
    flex: 1,
  },
});
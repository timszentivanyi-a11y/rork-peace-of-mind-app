import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Sun, Moon, Wind } from 'lucide-react-native';
import { Audio, AVPlaybackStatusSuccess, AVPlaybackStatus } from 'expo-av';
import { useApp } from '@/contexts/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'morning' | 'evening';
  icon: React.ReactNode;
}

export default function MeditationScreen() {
  const { state, giveMeditationCookie } = useApp();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const sessions: MeditationSession[] = [
    {
      id: 'morning1',
      title: 'Ranní probuzení',
      description: 'Pozitivní start do nového dne',
      duration: '6 min',
      type: 'morning',
      icon: <Sun color="#F59E0B" size={24} />,
    },
    {
      id: 'morning2',
      title: 'Ranní energie',
      description: 'Nabití energie na celý den',
      duration: '10 min',
      type: 'morning',
      icon: <Sun color="#F59E0B" size={24} />,
    },
    {
      id: 'evening1',
      title: 'Večerní klid',
      description: 'Uvolnění před spánkem',
      duration: '12 min',
      type: 'evening',
      icon: <Moon color="#6366F1" size={24} />,
    },
    {
      id: 'evening2',
      title: 'Hluboký spánek',
      description: 'Příprava na klidný spánek',
      duration: '14 min',
      type: 'evening',
      icon: <Moon color="#6366F1" size={24} />,
    },
  ];

  const sources: Record<string, string> = {
    morning1: 'https://www.bintigroup.com/app/peaceofmind/mp3/rano1.mp3',
    morning2: 'https://www.bintigroup.com/app/peaceofmind/mp3/rano2.mp3',
    evening1: 'https://www.bintigroup.com/app/peaceofmind/mp3/noc1.mp3',
    evening2: 'https://www.bintigroup.com/app/peaceofmind/mp3/noc2.mp3',
  };

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
        console.log('[Meditation] setAudioMode error', e);
      }
    };
    setup();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(err => console.log('[Meditation] unload error', err));
        soundRef.current = null;
      }
    };
  }, []);

  const stopCurrent = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (e) {
        console.log('[Meditation] stop error', e);
      }
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.log('[Meditation] unload error', e);
      }
      soundRef.current = null;
    }
  };

  const handlePlayPause = async (sessionId: string) => {
    console.log('[Meditation] handlePlayPause', { sessionId, playingId });
    
    if (playingId === sessionId && soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if ((status as AVPlaybackStatusSuccess).isLoaded && (status as AVPlaybackStatusSuccess).isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          Alert.alert('Pozastaveno', 'Meditace byla pozastavena');
          return;
        } else if ((status as AVPlaybackStatusSuccess).isLoaded) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          return;
        }
      } catch (e) {
        console.log('[Meditation] toggle error', e);
      }
    }

    await stopCurrent();

    const url = sources[sessionId];
    if (!url) {
      Alert.alert('Chyba', 'Nepodařilo se najít zdroj meditace.');
      return;
    }

    try {
      const session = sessions.find(s => s.id === sessionId);
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
      Alert.alert('Přehrává se', `Spuštěna meditace: ${session?.title ?? ''}`);
      
      if (session) {
        const cookieGiven = await giveMeditationCookie(session.type);
        if (cookieGiven) {
          Alert.alert('Sušenka přidána', `Získali jste sušenku za ${session.type === 'morning' ? 'ranní' : 'večerní'} meditaci! 🍪`);
        }
      }
    } catch (e) {
      console.log('[Meditation] play error', e);
      Alert.alert('Chyba přehrávání', 'Nepodařilo se spustit meditaci.');
    }
  };

  const renderSession = (session: MeditationSession) => (
    <View key={session.id} style={styles.sessionCard}>
      <View style={styles.sessionIcon}>
        {session.icon}
      </View>
      
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Text style={styles.sessionDescription}>{session.description}</Text>
        <Text style={styles.sessionDuration}>{session.duration}</Text>
      </View>

      <TouchableOpacity
        testID={`play-${session.id}`}
        style={[
          styles.playButton,
          playingId === session.id && isPlaying && styles.playButtonActive
        ]}
        onPress={() => handlePlayPause(session.id)}
      >
        {playingId === session.id && isPlaying ? (
          <Pause color="white" size={20} />
        ) : (
          <Play color="white" size={20} />
        )}
      </TouchableOpacity>
    </View>
  );

  const morningSessions = sessions.filter(s => s.type === 'morning');
  const eveningSessions = sessions.filter(s => s.type === 'evening');

  return (
    <LinearGradient colors={['#F0FDF4', '#E8F5E8']} style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top + 20 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.catMeditating}>
            <Text style={styles.catEmoji}>
              {playingId && isPlaying ? '🧘‍♀️' : '🐱'}
            </Text>
            <Text style={styles.catText}>
              {playingId && isPlaying ? `${state.petName || 'Mazlíček'} medituje s vámi` : `${state.petName || 'Mazlíček'} čeká na meditaci`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌅 Ranní meditace</Text>
            <Text style={styles.sectionDescription}>
              Začněte den s pozitivní energií
            </Text>
            {morningSessions.map(renderSession)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌙 Večerní meditace</Text>
            <Text style={styles.sectionDescription}>
              Uklidněte mysl před spánkem
            </Text>
            {eveningSessions.map(renderSession)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🫁 Dechová cvičení</Text>
            <Text style={styles.sectionDescription}>Uklidněte své tělo a zbavte se stresu</Text>

            <View style={styles.sessionCard}>
              <View style={styles.sessionIcon}>
                <Wind color="#10B981" size={24} />
              </View>

              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>Přejít ke cvičení</Text>
                <Text style={styles.sessionDescription}>Vědomé dýchání pro zklidnění</Text>
              </View>

              <TouchableOpacity
                testID={'play-breathing'}
                style={styles.playButton}
                onPress={() => {
                  console.log('[Meditation] navigate to breathing');
                  router.push('/breathing');
                }}
              >
                <Play color="white" size={20} />
              </TouchableOpacity>
            </View>
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
    textAlign: 'center',
  },
  catMeditating: {
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
});
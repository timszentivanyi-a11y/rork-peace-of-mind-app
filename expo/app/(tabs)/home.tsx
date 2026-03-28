import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Music, Settings, Cookie } from 'lucide-react-native';
import { router } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { getTodaysQuote } from '@/constants/motivationalQuotes';

export default function HomeScreen() {
  const { state, getTodayData, feedCat, setMood, setPetName } = useApp();
  const todayData = getTodayData();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [nameModalVisible, setNameModalVisible] = useState<boolean>(state.isFirstLaunch ?? false);
  const [petNameInput, setPetNameInput] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');

  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 10) {
      return 'Dobré ráno!';
    } else if (hour >= 10 && hour < 12) {
      return 'Dobré dopoledne!';
    } else if (hour >= 12 && hour < 18) {
      return 'Dobré odpoledne!';
    } else if (hour >= 18 && hour < 22) {
      return 'Dobrý večer!';
    } else {
      return 'Dobrou noc!';
    }
  };

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  type MoodOption = { value: 1 | 2 | 3 | 4 | 5; label: string; emoji: string };

  const moodOptions: MoodOption[] = useMemo(() => [
    { value: 1, label: 'Velmi špatná', emoji: '😞' },
    { value: 2, label: 'Spíše špatná', emoji: '☹️' },
    { value: 3, label: 'Neutrální', emoji: '😐' },
    { value: 4, label: 'Dobrá', emoji: '🙂' },
    { value: 5, label: 'Výborná', emoji: '😄' },
  ], []);

  const selectedMood = useMemo(() => moodOptions.find(m => m.value === (todayData.mood ?? 3)), [moodOptions, todayData.mood]);

  const handleFeedCat = async () => {
    if (state.cookies <= 0) {
      showModal('Žádné sušenky!', `Nemáte žádné sušenky na nakrmení mazlíčka}.`);
      return;
    }
    await feedCat();
    showModal(`${state.petName || 'Mazlíček'} je šťastnější!`, `Nakrmili jste ${state.petName || 'mazlíčka'} sušenkou! 🍪`);
  };

  const handleSavePetName = async () => {
    const trimmedName = petNameInput.trim();
    
    if (trimmedName.length < 3) {
      setNameError('Jméno musí mít alespoň 3 znaky');
      return;
    }
    
    setNameError('');
    await setPetName(trimmedName);
    setNameModalVisible(false);
    setPetNameInput('');
  };

  const handleSaveMood = async () => {
    showModal('Nálada uložena!', 'Vaše dnešní nálada byla uložena.');
  };

  const handleMoodChange = (mood: number) => {
    if (mood < 1 || mood > 5) return;
    console.log('[Home] Mood changed to', mood);
    setMood(mood);
  };

  return (
    <LinearGradient colors={['#F0FDF4', '#E8F5E8']} style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.streakContainer}>
              <Flame color="#F59E0B" size={32} />
              <Text style={styles.streakText}>{state.currentStreak} dní</Text>
            </View>
            <View style={styles.cookiesContainer}>
              <Cookie color="#D97706" size={28} />
              <Text style={styles.cookiesText}>{state.cookies}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/music')}
            >
              <Music color="#4A9B4A" size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/settings')}
            >
              <Settings color="#4A9B4A" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{getTimeBasedGreeting()}</Text>
          <Text style={styles.subtitle}>Jak se dnes cítíte?</Text>

          <View style={styles.petSection}>
            <Text style={styles.sectionTitle}>Můj mazlíček</Text>
            <View style={styles.petCard}>
              <Text style={styles.petEmoji}>
                {state.catHappiness > 70 ? '😺' : state.catHappiness > 30 ? '🐱' : '😿'}
              </Text>
              <Text style={styles.petName}>{state.petName || 'Mazlíček'}</Text>
              <Text style={styles.petHappiness}>Spokojenost: {state.catHappiness}%</Text>
              <TouchableOpacity style={styles.feedButton} onPress={handleFeedCat}>
                <Text style={styles.feedButtonText}>🍪 Nakrmit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>Dnešní nálada</Text>
            {Platform.OS !== 'web' ? (
              <Slider
                testID="mood-slider"
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={todayData.mood || 3}
                onValueChange={handleMoodChange}
                minimumTrackTintColor="#4ADE80"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#4ADE80"
              />
            ) : (
              <View style={styles.webMoodSelector} testID="web-mood-selector">
                <Text style={styles.moodLabel}>Vyberte náladu:</Text>
                <View style={styles.moodButtons}>
                  {moodOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      testID={`mood-opt-${opt.value}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Nálada ${opt.label}`}
                      style={[
                        styles.moodButton,
                        todayData.mood === opt.value && styles.moodButtonActive
                      ]}
                      onPress={() => handleMoodChange(opt.value)}
                    >
                      <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.moodDescriptor}>{selectedMood?.label ?? ''}</Text>
              </View>
            )}
            <View style={styles.moodOptionsRow}>
              {moodOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  testID={`native-mood-opt-${opt.value}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Nálada ${opt.label}`}
                  style={[
                    styles.moodOption,
                    todayData.mood === opt.value && styles.moodOptionActive
                  ]}
                  onPress={() => handleMoodChange(opt.value)}
                >
                  <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                  <Text style={styles.moodOptionLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveButton} testID="save-mood" onPress={handleSaveMood}>
              <Text style={styles.saveButtonText}>Uložit náladu</Text>
            </TouchableOpacity>
          </View>

            <View style={styles.motivationSection}>
            <Text style={styles.sectionTitle}>Motivace pro dnešní den</Text>
            <View style={styles.motivationCard}>
              <Text style={styles.motivationText}>
                &quot;{getTodaysQuote()}&quot;
              </Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Souhrn dnešních úkolů</Text>
            
            <View style={styles.progressCard}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Dobrý skutek</Text>
                <Text style={styles.progressStatus}>
                  {todayData.goodDeed ? '✅ Splněno' : '⏳ Zatím nesplněno'}
                </Text>
              </View>
              
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Vděčnost</Text>
                <Text style={styles.progressStatus}>
                  {todayData.gratitudes.length >= 3 ? '✅ Splněno' : `${todayData.gratitudes.length}/3`}
                </Text>
              </View>
              
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Ranní meditace</Text>
                <Text style={styles.progressStatus}>
                  {todayData.morningMeditationCookieReceived ? '✅ Splněno' : '⏳ Zatím nesplněno'}
                </Text>
              </View>
              
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Večerní meditace</Text>
                <Text style={styles.progressStatus}>
                  {todayData.eveningMeditationCookieReceived ? '✅ Splněno' : '⏳ Zatím nesplněno'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={nameModalVisible}
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.nameModalContent}>
              <Text style={styles.nameModalTitle}>🐱 Vítejte! 🐱</Text>
              <Text style={styles.nameModalMessage}>
                Pojmenujte si svého virtuálního mazlíčka, který vás bude provázet na cestě k lepšímu duševnímu zdraví.
              </Text>
              <TextInput
                style={[styles.nameInput, nameError ? styles.nameInputError : null]}
                value={petNameInput}
                onChangeText={(text) => {
                  setPetNameInput(text);
                  if (nameError && text.trim().length >= 3) {
                    setNameError('');
                  }
                }}
                placeholder="Zadejte jméno... (alespoň 3 znaky)"
                maxLength={20}
                autoFocus
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
              <View style={styles.nameModalButtons}>
                <TouchableOpacity
                  style={[
                    styles.nameModalButton, 
                    styles.nameModalButtonPrimary,
                    petNameInput.trim().length < 3 && styles.nameModalButtonDisabled
                  ]}
                  onPress={handleSavePetName}
                  disabled={petNameInput.trim().length < 3}
                >
                  <Text style={[
                    styles.nameModalButtonTextPrimary,
                    petNameInput.trim().length < 3 && styles.nameModalButtonTextDisabled
                  ]}>Potvrdit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  cookiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  cookiesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5A2D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
  },
  petSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 16,
  },
  petCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 8,
  },
  petHappiness: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  feedButton: {
    backgroundColor: '#4ADE80',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  feedButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  moodSection: {
    marginBottom: 30,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  webMoodSelector: {
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: 16,
    color: '#2D5A2D',
    marginBottom: 12,
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  moodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 155, 74, 0.2)',
  },
  moodButtonActive: {
    backgroundColor: '#4ADE80',
  },
  moodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A2D',
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodDescriptor: {
    marginTop: 8,
    textAlign: 'center',
    color: '#2D5A2D',
  },
  moodOptionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 155, 74, 0.15)'
  },
  moodOptionActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)'
  },
  moodOptionLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#2D5A2D',
    textAlign: 'center',
    width: '100%',
  },
  moodSelectedText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#2D5A2D',
    fontWeight: '600'
  },
  saveButton: {
    backgroundColor: '#4ADE80',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 114, 128, 0.1)',
  },
  progressLabel: {
    fontSize: 16,
    color: '#2D5A2D',
  },
  progressStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADE80',
  },
  motivationSection: {
    marginBottom: 30,
  },
  motivationCard: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  motivationText: {
    fontSize: 16,
    color: '#92400E',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsPreview: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A9B4A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#4ADE80',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  nameModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  nameModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5A2D',
    marginBottom: 16,
    textAlign: 'center',
  },
  nameModalMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  nameInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#4ADE80',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D5A2D',
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  nameModalButtons: {
    width: '100%',
    gap: 12,
  },
  nameModalButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  nameModalButtonPrimary: {
    backgroundColor: '#4ADE80',
  },
  nameModalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  nameModalButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nameModalButtonTextPrimary: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  nameModalButtonTextSecondary: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  nameInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  nameModalButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
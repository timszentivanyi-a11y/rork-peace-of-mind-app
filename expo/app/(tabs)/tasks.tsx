import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Check } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTodayAffirmation } from '@/constants/affirmations';

export default function TasksScreen() {
  const { getTodayData, addGoodDeed, addGratitude } = useApp();
  const [goodDeedText, setGoodDeedText] = useState<string>('');
  const [gratitudeText, setGratitudeText] = useState<string>('');
  const [isAddingGoodDeed, setIsAddingGoodDeed] = useState<boolean>(false);
  const [isAddingGratitude, setIsAddingGratitude] = useState<boolean>(false);

  const todayData = getTodayData();
  
  console.log('[Tasks] Current todayData:', todayData);
  console.log('[Tasks] GoodDeed exists:', !!todayData.goodDeed);
  console.log('[Tasks] Gratitudes count:', todayData.gratitudes.length);

  const handleAddGoodDeed = async () => {
    console.log('[Tasks] handleAddGoodDeed pressed');
    const text = goodDeedText.trim();
    if (!text) {
      Alert.alert('Chyba', 'Prosím napište dobrý skutek');
      return;
    }

    console.log('[Tasks] Current todayData before addGoodDeed', todayData);
    if (todayData.goodDeed) {
      Alert.alert('Info', 'Dnes už jste přidal dobrý skutek!');
      return;
    }

    setIsAddingGoodDeed(true);
    try {
      console.log('[Tasks] Calling addGoodDeed with text:', text);
      await addGoodDeed(text);
      setGoodDeedText('');
      console.log('[Tasks] GoodDeed added successfully');
      Alert.alert('Skvělé!', 'Dobrý skutek přidán! Získali jste sušenku 🍪');
    } catch (error) {
      console.error('Error adding good deed:', error);
      Alert.alert('Chyba', 'Nepodařilo se přidat dobrý skutek');
    } finally {
      setIsAddingGoodDeed(false);
    }
  };

  const handleAddGratitude = async () => {
    console.log('[Tasks] handleAddGratitude pressed');
    const text = gratitudeText.trim();
    if (!text) {
      Alert.alert('Chyba', 'Prosím napište za co jste vděční');
      return;
    }

    console.log('[Tasks] Current todayData before addGratitude', todayData);
    if ((todayData.gratitudes ?? []).length >= 3) {
      Alert.alert('Info', 'Dnes už jste přidal všechny tři vděčnosti!');
      return;
    }

    setIsAddingGratitude(true);
    try {
      console.log('[Tasks] Calling addGratitude with text:', text);
      await addGratitude(text);
      setGratitudeText('');
      console.log('[Tasks] Gratitude added successfully');
      Alert.alert('Skvělé!', 'Vděčnost přidána! Získali jste sušenku 🍪');
    } catch (error) {
      console.error('Error adding gratitude:', error);
      Alert.alert('Chyba', 'Nepodařilo se přidat vděčnost');
    } finally {
      setIsAddingGratitude(false);
    }
  };

  return (
    <LinearGradient colors={['#F0FDF4', '#E8F5E8']} style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>&nbsp;</Text>

          <View style={styles.affirmationSection}>
            <Text style={styles.sectionTitle}>Dnešní afirmace</Text>
            <Text style={styles.affirmationSubtitle}>Tuto afirmaci si dnes několikrát opakujte</Text>
            <View style={styles.affirmationCard}>
              <Text style={styles.affirmationText}>
                &quot;{getTodayAffirmation()}&quot;
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Dobrý skutek {todayData.goodDeed && '✅'}
            </Text>
            <Text style={styles.sectionDescription}>
              Napište jeden dobrý skutek, který jste dnes udělali
            </Text>
            
            {todayData.goodDeed ? (
              <View style={styles.completedTask} testID="goodDeedItem">
                <Check color="#4ADE80" size={20} />
                <Text style={styles.completedText}>{todayData.goodDeed.text}</Text>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <TextInput
                  testID="goodDeedInput"
                  style={styles.textInput}
                  placeholder="Např. Pomohl jsem sousedovi s nákupem..."
                  value={goodDeedText}
                  onChangeText={setGoodDeedText}
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity 
                  testID="goodDeedAddButton"
                  style={[styles.addButton, isAddingGoodDeed && styles.addButtonDisabled]} 
                  onPress={handleAddGoodDeed}
                  disabled={isAddingGoodDeed}
                >
                  <Plus color="white" size={20} />
                  <Text style={styles.addButtonText}>
                    {isAddingGoodDeed ? 'Přidávám...' : 'Přidat'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Vděčnost ({todayData.gratitudes.length}/3) {todayData.gratitudes.length === 3 && '✅'}
            </Text>
            <Text style={styles.sectionDescription}>
              Napište tři věci, za které jste dnes vděční (jakákoliv maličkost se počítá)
            </Text>

            {todayData.gratitudes.map((gratitude, index) => (
              <View key={gratitude.id} style={styles.completedTask} testID={`gratitudeItem-${index}`}>
                <Check color="#4ADE80" size={20} />
                <Text style={styles.completedText}>{gratitude.text}</Text>
              </View>
            ))}

            {todayData.gratitudes.length < 3 && (
              <View style={styles.inputContainer}>
                <TextInput
                  testID="gratitudeInput"
                  style={styles.textInput}
                  placeholder="Např. Za to, že dnes krásně svítilo slunce..."
                  value={gratitudeText}
                  onChangeText={setGratitudeText}
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity 
                  testID="gratitudeAddButton"
                  style={[styles.addButton, isAddingGratitude && styles.addButtonDisabled]} 
                  onPress={handleAddGratitude}
                  disabled={isAddingGratitude}
                >
                  <Plus color="white" size={20} />
                  <Text style={styles.addButtonText}>
                    {isAddingGratitude ? 'Přidávám...' : 'Přidat'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {todayData.completed && (
            <View style={styles.completionBanner}>
              <Text style={styles.completionText}>
                🎉 Skvělá práce! Dokončili jste všechny dnešní úkoly!
              </Text>
            </View>
          )}

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
    marginBottom: 30,
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
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: '#2D5A2D',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#4ADE80',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  completedTask: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  completedText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2D5A2D',
  },
  completionBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  completionText: {
    fontSize: 16,
    color: '#15803D',
    textAlign: 'center',
    fontWeight: '600',
  },
  affirmationSection: {
    marginBottom: 30,
  },
  affirmationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  affirmationCard: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  affirmationText: {
    fontSize: 16,
    color: '#92400E',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  Download, 
  Upload, 
  Sun, 
  Moon, 
  Clock,
  Trash2,
  ArrowLeft,
  Edit3
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { state, exportData, importData, setPetName } = useApp();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState({
    morning: true,
    evening: true,
    daily: true,
  });
  const [notificationTimes, setNotificationTimes] = useState({
    morning: '07:00',
    evening: '21:00',
    daily: '18:00',
  });
  const [importText, setImportText] = useState('');
  const [showImportInput, setShowImportInput] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleExportData = async () => {
    try {
      await exportData();
      console.log('Data exported successfully');
    } catch {
      console.log('Export failed');
    }
  };

  const handleImportData = async () => {
    if (!importText.trim()) {
      console.log('No import data provided');
      return;
    }

    try {
      await importData(importText);
      setImportText('');
      setShowImportInput(false);
      console.log('Data imported successfully');
    } catch {
      console.log('Import failed');
    }
  };

  const handleClearData = () => {
    console.log('Clear data requested');
  };

  const handleChangePetName = () => {
    setNewPetName(state.petName || 'Míru');
    setNameModalVisible(true);
  };

  const handleSavePetName = async () => {
    const trimmedName = newPetName.trim();
    
    if (trimmedName.length < 3) {
      setNameError('Jméno musí mít alespoň 3 znaky');
      return;
    }
    
    setNameError('');
    await setPetName(trimmedName);
    setNameModalVisible(false);
    setNewPetName('');
  };

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
        <Text style={styles.title}>Nastavení</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>

          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🐱 Mazlíček</Text>
            <Text testID="current-pet-name" style={styles.currentPetNameDisplay}>Aktuální jméno: {state.petName || 'Míru'}</Text>
            <TouchableOpacity testID="change-pet-name" style={styles.actionButton} onPress={handleChangePetName}>
              <Edit3 color="#8B5CF6" size={20} />
              <View style={styles.petNameInfo}>
                <Text style={styles.actionButtonText}>Změnit jméno mazlíčka</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Oznámení</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Sun color="#F59E0B" size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Ranní meditace</Text>
                  <Text style={styles.settingDescription}>
                    Připomínka ranní meditace
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.morning}
                onValueChange={(value) => 
                  setNotifications(prev => ({ ...prev, morning: value }))
                }
                trackColor={{ false: '#D1D5DB', true: '#4ADE80' }}
                thumbColor={notifications.morning ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>

            {notifications.morning && (
              <View style={styles.timeInput}>
                <Clock color="#6B7280" size={16} />
                <TextInput
                  style={styles.timeText}
                  value={notificationTimes.morning}
                  onChangeText={(text) => 
                    setNotificationTimes(prev => ({ ...prev, morning: text }))
                  }
                  placeholder="07:00"
                />
              </View>
            )}

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Moon color="#6366F1" size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Večerní meditace</Text>
                  <Text style={styles.settingDescription}>
                    Připomínka večerní meditace
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.evening}
                onValueChange={(value) => 
                  setNotifications(prev => ({ ...prev, evening: value }))
                }
                trackColor={{ false: '#D1D5DB', true: '#4ADE80' }}
                thumbColor={notifications.evening ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>

            {notifications.evening && (
              <View style={styles.timeInput}>
                <Clock color="#6B7280" size={16} />
                <TextInput
                  style={styles.timeText}
                  value={notificationTimes.evening}
                  onChangeText={(text) => 
                    setNotificationTimes(prev => ({ ...prev, evening: text }))
                  }
                  placeholder="21:00"
                />
              </View>
            )}

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell color="#10B981" size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Denní úkoly</Text>
                  <Text style={styles.settingDescription}>
                    Připomínka dokončení úkolů
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.daily}
                onValueChange={(value) => 
                  setNotifications(prev => ({ ...prev, daily: value }))
                }
                trackColor={{ false: '#D1D5DB', true: '#4ADE80' }}
                thumbColor={notifications.daily ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>

            {notifications.daily && (
              <View style={styles.timeInput}>
                <Clock color="#6B7280" size={16} />
                <TextInput
                  style={styles.timeText}
                  value={notificationTimes.daily}
                  onChangeText={(text) => 
                    setNotificationTimes(prev => ({ ...prev, daily: text }))
                  }
                  placeholder="18:00"
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 Správa dat</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
              <Download color="#4ADE80" size={20} />
              <Text style={styles.actionButtonText}>Exportovat data</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowImportInput(!showImportInput)}
            >
              <Upload color="#3B82F6" size={20} />
              <Text style={styles.actionButtonText}>Importovat data</Text>
            </TouchableOpacity>

            {showImportInput && (
              <View style={styles.importContainer}>
                <TextInput
                  style={styles.importInput}
                  value={importText}
                  onChangeText={setImportText}
                  placeholder="Vložte exportovaná data zde..."
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity style={styles.importButton} onPress={handleImportData}>
                  <Text style={styles.importButtonText}>Importovat</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]} 
              onPress={handleClearData}
            >
              <Trash2 color="#EF4444" size={20} />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Smazat všechna data
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ O aplikaci</Text>
            <View style={styles.infoCard}>
              <Text style={styles.appName}>Peace of Mind</Text>
              <Text style={styles.appVersion}>Verze 1.0.0</Text>
              <Text style={styles.appDescription}>
                Aplikace pro péči o duševní zdraví s virtuálním mazlíčkem {state.petName || 'Míru'}.
                Každý den si zapisujte dobré skutky a věci za které jste vděční.
              </Text>
            </View>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={nameModalVisible}
          onRequestClose={() => setNameModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.nameModalContent}>
              <Text style={styles.nameModalTitle}>🐱 Změnit jméno mazlíčka</Text>
              <Text style={styles.nameModalMessage}>
                Zadejte nové jméno pro vašeho virtuálního mazlíčka.
              </Text>
              <TextInput
                style={[styles.nameInput, nameError ? styles.nameInputError : null]}
                value={newPetName}
                onChangeText={(text) => {
                  setNewPetName(text);
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
                  style={[styles.nameModalButton, styles.nameModalButtonSecondary]}
                  onPress={() => setNameModalVisible(false)}
                >
                  <Text style={styles.nameModalButtonTextSecondary}>Zrušit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.nameModalButton, 
                    styles.nameModalButtonPrimary, 
                    newPetName.trim().length < 3 && styles.nameModalButtonDisabled
                  ]}
                  onPress={handleSavePetName}
                  disabled={newPetName.trim().length < 3}
                >
                  <Text style={[
                    styles.nameModalButtonTextPrimary,
                    newPetName.trim().length < 3 && styles.nameModalButtonTextDisabled
                  ]}>Uložit</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5A2D',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'left',
  },

  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A2D',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginLeft: 16,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2D5A2D',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A2D',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  dangerText: {
    color: '#EF4444',
  },
  importContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  importInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D5A2D',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  importButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5A2D',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  petNameInfo: {
    marginLeft: 12,
    flex: 1,
  },
  currentPetName: {
    fontSize: 14,
    color: '#8B5CF6',
    marginTop: 2,
  },
  currentPetNameDisplay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5A2D',
    marginBottom: 10,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5A2D',
    marginBottom: 12,
    textAlign: 'center',
  },
  nameModalMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  nameModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  nameModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
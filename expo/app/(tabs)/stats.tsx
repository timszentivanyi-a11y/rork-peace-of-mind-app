import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function StatsScreen() {
  const { state } = useApp();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getBadgeIcon = (level: number) => {
    if (level >= 30) return { icon: '🌳', name: 'Věčně zelený strom', color: '#059669' };
    if (level >= 14) return { icon: '🌸', name: 'Třešňový květ', color: '#DC2626' };
    if (level >= 7) return { icon: '🌿', name: 'Lístek pro štěstí', color: '#65A30D' };
    return { icon: '🌱', name: 'Klíček k radosti', color: '#84CC16' };
  };

  const currentBadge = getBadgeIcon(state.currentStreak);

  const moodToLabel = (mood?: number): string => {
    if (!mood) return '';
    switch (mood) {
      case 1:
        return 'velmi špatná';
      case 2:
        return 'spíše špatná';
      case 3:
        return 'neutrální';
      case 4:
        return 'dobrá';
      case 5:
        return 'výborná';
      default:
        return '';
    }
  };

  const getRecentDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = state.dayData.find(d => d.date === dateString);
      
      days.push({
        date: dateString,
        day: date.getDate(),
        completed: dayData?.completed || false,
        cookies: (() => {
          const cookieKeys: Array<'dailyCookieReceived' | 'goodDeedCookieReceived' | 'gratitudeCookieReceived' | 'morningMeditationCookieReceived' | 'eveningMeditationCookieReceived'> = [
            'dailyCookieReceived',
            'goodDeedCookieReceived',
            'gratitudeCookieReceived',
            'morningMeditationCookieReceived',
            'eveningMeditationCookieReceived',
          ];
          return cookieKeys.reduce((sum, key) => sum + (dayData?.[key] ? 1 : 0), 0);
        })(),
      });
    }
    return days;
  };

  const getCalendarDays = () => {
    const today = new Date();
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0];
      const dayData = state.dayData.find(d => d.date === dateString);
      const isCurrentMonth = current.getMonth() === month;
      const isToday = dateString === today.toISOString().split('T')[0];
      const isSelected = dateString === selectedDate;
      
      days.push({
        date: dateString,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        hasData: !!dayData && (!!dayData.goodDeed || dayData.gratitudes.length > 0 || !!dayData.mood),
        completed: dayData?.completed || false,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getSelectedDateData = () => {
    return state.dayData.find(d => d.date === selectedDate);
  };

  const formatDateHeader = () => {
    return currentMonth.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
  };

  const canGoBack = () => {
    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 12, 1);
    return currentMonth > twelveMonthsAgo;
  };

  const canGoForward = () => {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentMonth < currentMonthStart;
  };

  const goToPreviousMonth = () => {
    if (canGoBack()) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    }
  };

  const goToNextMonth = () => {
    if (canGoForward()) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    }
  };

  const recentDays = getRecentDays();
  const maxCookies = Math.max(...recentDays.map(d => d.cookies), 1);

  return (
    <LinearGradient colors={['#F0FDF4', '#E8F5E8']} style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>&nbsp;</Text>

          <View style={styles.badgeSection}>
            <Text style={styles.sectionTitle}>🏆 Aktuální odznak</Text>
            <View style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>{currentBadge.icon}</Text>
              <Text style={styles.badgeName}>{currentBadge.name}</Text>
              <Text style={styles.badgeDescription}>
                {state.currentStreak} dní v řadě
              </Text>
            </View>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>📊 Získané sušenky (7 dní)</Text>
            </View>
            <View style={styles.chartContainer}>
              <View style={styles.labelsRow} pointerEvents="none" testID="cookies-labels-row">
                {recentDays.map((day, index) => (
                  <View key={`label-${day.date}`} style={styles.labelItem}>
                    <Text style={styles.valueLabel} testID={`cookies-value-${index}`}>{day.cookies}</Text>
                  </View>
                ))}
              </View>
              {recentDays.map((day) => (
                <View key={day.date} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <LinearGradient
                      colors={day.cookies > 0 ? ['#4ADE80', '#22C55E'] : ['#E5E7EB', '#E5E7EB']}
                      style={[
                        styles.bar,
                        { height: day.cookies === maxCookies ? 65 : (day.cookies / maxCookies) * 80 }
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{day.day}</Text>
                  {day.completed && (
                    <Text style={styles.completedDot}>●</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{state.dayData.length}</Text>
              <Text style={styles.statLabel}>Celkem dní</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{state.cookies}</Text>
              <Text style={styles.statLabel}>Sušenky</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{state.catHappiness}%</Text>
              <Text style={styles.statLabel}>Spokojenost mazlíčka</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {state.dayData.filter(d => d.completed).length}
              </Text>
              <Text style={styles.statLabel}>Dokončené dny</Text>
            </View>
          </View>

          <View style={styles.calendarSection}>
            <Text style={styles.sectionTitle}>📅 Poslední záznamy</Text>
            
            <View style={styles.calendarContainer}>
              <View style={styles.monthNavigation}>
                <TouchableOpacity 
                  style={[styles.navButton, !canGoBack() && styles.navButtonDisabled]}
                  onPress={goToPreviousMonth}
                  disabled={!canGoBack()}
                >
                  <ChevronLeft 
                    size={20} 
                    color={canGoBack() ? '#2D5A2D' : '#9CA3AF'} 
                  />
                </TouchableOpacity>
                
                <Text style={styles.monthHeader}>{formatDateHeader()}</Text>
                
                <TouchableOpacity 
                  style={[styles.navButton, !canGoForward() && styles.navButtonDisabled]}
                  onPress={goToNextMonth}
                  disabled={!canGoForward()}
                >
                  <ChevronRight 
                    size={20} 
                    color={canGoForward() ? '#2D5A2D' : '#9CA3AF'} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.weekDaysHeader}>
                {['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'].map((day) => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.calendarGrid}>
                {getCalendarDays().map((day) => (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.calendarDay,
                      !day.isCurrentMonth && styles.calendarDayInactive,
                      // ensure today/selected use the same solid green and are not overridden by data background
                      day.hasData && !day.isToday && !day.isSelected && styles.calendarDayWithData,
                      day.isSelected && styles.calendarDaySelected,
                    ]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <View style={styles.dayNumberWrap} testID={`day-number-${day.date}`}>
                      <Text style={[
                        styles.calendarDayText,
                        !day.isCurrentMonth && styles.calendarDayTextInactive,
                        day.isSelected && styles.calendarDayTextSelected,
                      ]}>
                        {day.day}
                      </Text>
                    </View>
                    {day.hasData && !day.isToday && (
                      <View style={styles.calendarDayDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {getSelectedDateData() && (
              <View style={styles.selectedDateData}>
                <Text style={styles.selectedDateTitle}>
                  {new Date(selectedDate).toLocaleDateString('cs-CZ', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                
                {getSelectedDateData()?.mood != null && (
                  <View style={styles.entryItem}>
                    <Text style={styles.entryLabel}>🙂 Nálada:</Text>
                    <Text style={styles.entryText} testID="selected-day-mood">
                      {moodToLabel(getSelectedDateData()?.mood)}
                    </Text>
                  </View>
                )}
                
                {getSelectedDateData()?.goodDeed && (
                  <View style={styles.entryItem}>
                    <Text style={styles.entryLabel}>💝 Dobrý skutek:</Text>
                    <Text style={styles.entryText}>{getSelectedDateData()?.goodDeed?.text}</Text>
                  </View>
                )}
                
                {getSelectedDateData()?.gratitudes.map((gratitude) => (
                  <View key={gratitude.id} style={styles.entryItem}>
                    <Text style={styles.entryLabel}>🙏 Vděčnost:</Text>
                    <Text style={styles.entryText}>{gratitude.text}</Text>
                  </View>
                ))}
                
                {!getSelectedDateData()?.goodDeed && getSelectedDateData()?.gratitudes.length === 0 && !getSelectedDateData()?.mood && (
                  <Text style={styles.noDataText}>Žádné záznamy pro tento den</Text>
                )}
              </View>
            )}
            
            {!getSelectedDateData() && (
              <View style={styles.selectedDateData}>
                <Text style={styles.selectedDateTitle}>
                  {new Date(selectedDate).toLocaleDateString('cs-CZ', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.noDataText}>Žádné záznamy pro tento den</Text>
              </View>
            )}
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#4ADE80',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: 'white',
  },
  badgeSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 12,
  },
  badgeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  chartSection: {
    marginBottom: 30,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    height: 140,
    position: 'relative',
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 100,
    position: 'relative',
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  maxCookiesValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A2D',
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  completedDot: {
    fontSize: 8,
    color: '#4ADE80',
    marginTop: 2,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D5A2D',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5A2D',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  calendarSection: {
    marginBottom: 30,
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A2D',
    textAlign: 'center',
    textTransform: 'capitalize',
    flex: 1,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 90, 45, 0.1)',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: '#4ADE80',
    borderRadius: 8,
    opacity: 1,
  },
  calendarDaySelected: {
    backgroundColor: '#4ADE80',
    borderRadius: 8,
    opacity: 1,
  },
  calendarDayWithData: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  dayNumberWrap: {
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#2D5A2D',
    fontWeight: '500',
  },
  calendarDayTextInactive: {
    color: '#9CA3AF',
  },
  calendarDayTextToday: {
    fontWeight: '600',
    color: 'white',
  },
  calendarDayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  calendarDayDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },
  selectedDateData: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  entryItem: {
    marginBottom: 12,
  },
  entryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 4,
  },
  entryText: {
    fontSize: 14,
    color: '#4B5563',
    paddingLeft: 8,
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  labelsRow: {
    position: 'absolute',
    top: 5,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  labelItem: {
    flex: 1,
    alignItems: 'center',
  },
});
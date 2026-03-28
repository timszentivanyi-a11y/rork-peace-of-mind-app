import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface GoodDeed {
  id: string;
  text: string;
  date: string;
}

export interface Gratitude {
  id: string;
  text: string;
  date: string;
}

export interface DayData {
  date: string;
  goodDeed?: GoodDeed;
  gratitudes: Gratitude[];
  completed: boolean;
  mood?: number; // 1-5 scale
  dailyCookieReceived?: boolean;
  goodDeedCookieReceived?: boolean;
  gratitudeCookieReceived?: boolean;
  morningMeditationCookieReceived?: boolean;
  eveningMeditationCookieReceived?: boolean;
}

export interface AppState {
  cookies: number;
  catHappiness: number; // 0-100
  currentStreak: number;
  longestStreak: number;
  dayData: DayData[];
  lastFeedTime?: string;
  petName?: string;
  isFirstLaunch?: boolean;
}

const initialState: AppState = {
  cookies: 0,
  catHappiness: 0,
  currentStreak: 0,
  longestStreak: 0,
  dayData: [],
  petName: 'Míru',
  isFirstLaunch: true,
};



export const [AppProvider, useApp] = createContextHook(() => {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('[AppContext] Current state:', state);

  const loadData = useCallback(async () => {
    try {
      console.log('Loading data...');
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = useCallback(async (newState: AppState) => {
    try {
      if (!newState || typeof newState !== 'object') {
        console.error('Invalid state object');
        return;
      }
      const dataString = JSON.stringify(newState);
      if (dataString && dataString.length > 0 && dataString.length < 1000000) {
        console.log('Saving data:', dataString.substring(0, 100));
        setState(newState);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, []);

  const getTodayString = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const getTodayData = useCallback((): DayData => {
    const today = getTodayString();
    return state.dayData.find(d => d.date === today) || {
      date: today,
      gratitudes: [],
      completed: false,
    };
  }, [state.dayData, getTodayString]);

  const addGoodDeed = useCallback(async (text: string) => {
    const today = getTodayString();
    const todayData = getTodayData();
    
    console.log('[AppContext] addGoodDeed - current todayData:', todayData);
    
    if (todayData.goodDeed) {
      console.log('[AppContext] Good deed already exists for today');
      return;
    }
    
    const newGoodDeed: GoodDeed = {
      id: Date.now().toString(),
      text,
      date: today,
    };

    const updatedDayData = state.dayData.filter(d => d.date !== today);
    const shouldGiveCookie = !todayData.goodDeedCookieReceived;
    const newTodayData: DayData = {
      ...todayData,
      goodDeed: newGoodDeed,
      goodDeedCookieReceived: true,
      completed: todayData.gratitudes.length >= 3 && newGoodDeed !== undefined,
    };

    console.log('[AppContext] addGoodDeed - newTodayData:', newTodayData);

    const newState = {
      ...state,
      cookies: shouldGiveCookie ? state.cookies + 1 : state.cookies,
      dayData: [...updatedDayData, newTodayData],
    };

    await saveData(newState);
  }, [state, getTodayString, getTodayData, saveData]);

  const addGratitude = useCallback(async (text: string) => {
    const today = getTodayString();
    const todayData = getTodayData();
    
    console.log('[AppContext] addGratitude - current todayData:', todayData);
    
    if (todayData.gratitudes.length >= 3) {
      console.log('[AppContext] Gratitude already exists for today');
      return;
    }

    const newGratitude: Gratitude = {
      id: Date.now().toString(),
      text,
      date: today,
    };

    const updatedDayData = state.dayData.filter(d => d.date !== today);
    const newGratitudes = [...todayData.gratitudes, newGratitude];
    const shouldGiveCookie = !todayData.gratitudeCookieReceived && newGratitudes.length >= 3;
    const newTodayData: DayData = {
      ...todayData,
      gratitudes: newGratitudes,
      gratitudeCookieReceived: shouldGiveCookie ? true : (todayData.gratitudeCookieReceived ?? false),
      completed: todayData.goodDeed !== undefined && newGratitudes.length >= 3,
    };

    console.log('[AppContext] addGratitude - newTodayData:', newTodayData);

    const newState = {
      ...state,
      cookies: shouldGiveCookie ? state.cookies + 1 : state.cookies,
      dayData: [...updatedDayData, newTodayData],
    };

    await saveData(newState);
  }, [state, getTodayString, getTodayData, saveData]);

  const updateStreak = useCallback(async () => {
    const sortedDays = state.dayData
      .filter(d => d.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDays.length; i++) {
      const dayDate = new Date(sortedDays[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (dayDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    const newState = {
      ...state,
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
    };

    await saveData(newState);
  }, [state, saveData]);

  const setMood = useCallback(async (mood: number) => {
    const today = getTodayString();
    const todayData = getTodayData();
    
    const updatedDayData = state.dayData.filter(d => d.date !== today);
    const newTodayData: DayData = {
      ...todayData,
      mood,
    };

    const newState = {
      ...state,
      dayData: [...updatedDayData, newTodayData],
    };

    await saveData(newState);
  }, [state, getTodayString, getTodayData, saveData]);

  const feedCat = useCallback(async () => {
    if (state.cookies <= 0) return;

    const newState = {
      ...state,
      cookies: state.cookies - 1,
      catHappiness: Math.min(100, state.catHappiness + 20),
      lastFeedTime: new Date().toISOString(),
    };

    await saveData(newState);
  }, [state, saveData]);

  const exportData = useCallback(async (): Promise<string> => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback(async (data: string) => {
    try {
      if (!data || data.trim().length === 0) {
        throw new Error('Empty data');
      }
      const sanitizedData = data.trim();
      if (sanitizedData.length > 100000) {
        throw new Error('Data too large');
      }
      const importedState = JSON.parse(sanitizedData);
      await saveData(importedState);
    } catch {
      throw new Error('Neplatná data pro import');
    }
  }, [saveData]);

  const setPetName = useCallback(async (name: string) => {
    const newState = {
      ...state,
      petName: name,
      isFirstLaunch: false,
    };
    await saveData(newState);
  }, [state, saveData]);

  const checkAndGiveDailyCookie = useCallback(async () => {
    const today = getTodayString();
    const todayData = getTodayData();
    
    if (!todayData.dailyCookieReceived) {
      const updatedDayData = state.dayData.filter(d => d.date !== today);
      const newTodayData: DayData = {
        ...todayData,
        dailyCookieReceived: true,
      };

      const newState = {
        ...state,
        cookies: state.cookies + 1,
        dayData: [...updatedDayData, newTodayData],
      };

      await saveData(newState);
      console.log('Daily cookie given!');
    }
  }, [state, getTodayString, getTodayData, saveData]);

  const giveMeditationCookie = useCallback(async (type: 'morning' | 'evening') => {
    const today = getTodayString();
    const todayData = getTodayData();
    
    const cookieKey = type === 'morning' ? 'morningMeditationCookieReceived' : 'eveningMeditationCookieReceived';
    
    if (!todayData[cookieKey]) {
      const updatedDayData = state.dayData.filter(d => d.date !== today);
      const newTodayData: DayData = {
        ...todayData,
        [cookieKey]: true,
      };

      const newState = {
        ...state,
        cookies: state.cookies + 1,
        dayData: [...updatedDayData, newTodayData],
      };

      await saveData(newState);
      console.log(`${type} meditation cookie given!`);
      return true;
    }
    return false;
  }, [state, getTodayString, getTodayData, saveData]);





  useEffect(() => {
    if (!isLoading) {
      checkAndGiveDailyCookie();
    }
  }, [checkAndGiveDailyCookie, isLoading]);

  return useMemo(() => ({
    state,
    isLoading,
    getTodayData,
    addGoodDeed,
    addGratitude,
    feedCat,
    setMood,
    exportData,
    importData,
    setPetName,
    saveData,
    getTodayString,
    updateStreak,
    checkAndGiveDailyCookie,
    giveMeditationCookie,
  }), [state, isLoading, getTodayData, addGoodDeed, addGratitude, feedCat, setMood, exportData, importData, setPetName, saveData, getTodayString, updateStreak, checkAndGiveDailyCookie, giveMeditationCookie]);
});




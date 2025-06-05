// app/screens/FullCalendarScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/FullCalendarStyles';
import { ApiService } from '../services/api';
import { useToast } from '../utils/ToastContext';
import FullCalendar from '../components/Test/FullCalendar';

// Define interfaces
export interface TestItem {
  _id: string;
  userID: string;
  itemID: string;
  startDate: string;
  finishDate: string;
  completed: boolean;
  result: 'Critic' | 'Sensitive' | 'Safe' | null;
}

export default function FullCalendarScreen(): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTests, setActiveTests] = useState<TestItem[]>([]);
  const [completedTests, setCompletedTests] = useState<TestItem[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Load tests on component mount
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async (): Promise<void> => {
    setLoading(true);
    try {
      const tests = await ApiService.getTests();
      
      // Separate active and completed tests
      const active = tests.filter((test: TestItem) => !test.completed);
      const completed = tests.filter((test: TestItem) => test.completed);
      
      setActiveTests(active);
      setCompletedTests(completed);
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      showToast('Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Combine all tests for the calendar
  const allTests = [...activeTests, ...completedTests];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.backText}>Test</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {formatMonthYear(currentDate)}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <ScrollView style={styles.scrollView}>
        <FullCalendar 
          currentDate={currentDate}
          tests={allTests}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
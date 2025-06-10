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
import { sampleProducts, Product } from '../data/productData';

// Define interfaces
export interface TestItem {
  _id: string;
  userID: string;
  itemID: string;
  startDate: string;
  finishDate: string;
  completed: boolean;
  result: 'Critic' | 'Sensitive' | 'Safe' | null;
  updatedAt?: string;
  createdAt?: string;
}

interface CompactHistoryItem {
  date: string;
  name: string;
  status: 'Critic' | 'Sensitive' | 'Safe';
  timeAgo: string;
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

  const getProductName = (productId: string): string => {
    const product = sampleProducts.find((p: Product) => p.code === productId);
    return product?.product_name || `Product ${productId.substring(0, 8)}...`;
  };

  const formatDateForHistory = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  // Calculate time ago from reaction
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const reactionDate = new Date(dateString);
    const diffInMs = now.getTime() - reactionDate.getTime();
    
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years}y ago`;
    } else if (months > 0) {
      return `${months}mo ago`;
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return `${seconds}s ago`;
    }
  };

  // Prepare compact history data
  const compactHistory: CompactHistoryItem[] = completedTests
    .sort((a, b) => new Date(b.finishDate).getTime() - new Date(a.finishDate).getTime())
    .map(test => ({
      date: formatDateForHistory(test.finishDate),
      name: getProductName(test.itemID),
      status: test.result as 'Critic' | 'Sensitive' | 'Safe' || 'Safe',
      timeAgo: getTimeAgo(test.updatedAt || test.finishDate)
    }));

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

        {/* Compact Legend */}
        <View style={styles.compactLegendContainer}>
          <View style={styles.compactLegendItems}>
            <View style={styles.compactLegendItem}>
              <View style={[styles.compactLegendDot, styles.activeTestDot]} />
              <Text style={styles.compactLegendText}>Active</Text>
            </View>
            <View style={styles.compactLegendItem}>
              <View style={[styles.compactLegendDot, styles.criticTestDot]} />
              <Text style={styles.compactLegendText}>Critic</Text>
            </View>
            <View style={styles.compactLegendItem}>
              <View style={[styles.compactLegendDot, styles.sensitiveTestDot]} />
              <Text style={styles.compactLegendText}>Sensitive</Text>
            </View>
            <View style={styles.compactLegendItem}>
              <View style={[styles.compactLegendDot, styles.safeTestDot]} />
              <Text style={styles.compactLegendText}>Safe</Text>
            </View>
          </View>
        </View>

        {/* All Tests Made Title */}
        <Text style={styles.allTestsTitle}>All tests made</Text>

        {/* Complete Test History - Compact View */}
        {compactHistory.length > 0 && (
          <View style={styles.compactHistoryContainer}>
            <View style={styles.compactHistoryList}>
              {compactHistory.map((item, index) => (
                <View key={index} style={styles.compactHistoryItem}>
                  <View style={styles.compactHistoryLeft}>
                    <Text style={styles.compactHistoryDate}>{item.date}</Text>
                    <Text style={styles.compactHistoryName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <View style={styles.compactHistoryRight}>
                    <View style={[
                      styles.compactHistoryStatus,
                      item.status === 'Critic' ? styles.compactCriticStatus :
                      item.status === 'Sensitive' ? styles.compactSensitiveStatus :
                      styles.compactSafeStatus
                    ]}>
                      <Text style={[
                        styles.compactStatusText,
                        item.status === 'Critic' ? styles.compactCriticText :
                        item.status === 'Sensitive' ? styles.compactSensitiveText :
                        styles.compactSafeText
                      ]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
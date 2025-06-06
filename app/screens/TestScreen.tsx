// app/screens/TestScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity
} from 'react-native';
import { styles } from '../styles/TestStyles';
import { ApiService } from '../services/api';
import { useToast } from '../utils/ToastContext';
import { useRouter } from 'expo-router';
import TestCalendar from '../components/Test/TestCalendar';
import TestItem from '../components/Test/TestItem';

import TestCompletionModal from '../components/Test/TestCompletionModal';

import { sampleProducts, Product } from '../data/productData';

// Define interfaces with specific types
export interface TestItem {
  _id: string;
  userID: string;
  itemID: string;
  startDate: string;
  finishDate: string;
  completed: boolean;
  result: 'Critic' | 'Sensitive' | 'Safe' | null;
}

export interface HistoryItem {
  date: string;
  name: string;
  status: 'Critic' | 'Safe';
  notes?: string;
}

export default function TestScreen(): JSX.Element {
  const router = useRouter();
  // Initialize selected date to today - create a new Date object for today
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTests, setActiveTests] = useState<TestItem[]>([]);
  const [completedTests, setCompletedTests] = useState<TestItem[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestItem[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [selectedTestForCompletion, setSelectedTestForCompletion] = useState<{
    testId: string;
    productId: string;
  } | null>(null);
  const { showToast } = useToast();

  // Load tests on component mount
  useEffect(() => {
    fetchTests();
  }, []);

  // Filter tests based on selected date
  useEffect(() => {
    if (activeTests.length > 0) {
      const testsForSelectedDate = activeTests.filter((test: TestItem) => {
        const testStartDate = new Date(test.startDate);
        const testFinishDate = new Date(test.finishDate);
        
        // Check if selected date falls within this test period
        return (selectedDate >= testStartDate && selectedDate <= testFinishDate);
      });
      
      setFilteredTests(testsForSelectedDate);
    }
  }, [selectedDate, activeTests]);

  const fetchTests = async (): Promise<void> => {
    setLoading(true);
    try {
      const tests = await ApiService.getTests();
      
      // Separate active and completed tests
      const active = tests.filter((test: TestItem) => !test.completed);
      const completed = tests.filter((test: TestItem) => test.completed);
      
      setActiveTests(active);
      setCompletedTests(completed);
      
      // Filter tests for selected date
      const testsForSelectedDate = active.filter((test: TestItem) => {
        const testStartDate = new Date(test.startDate);
        const testFinishDate = new Date(test.finishDate);
        
        return (selectedDate >= testStartDate && selectedDate <= testFinishDate);
      });
      
      setFilteredTests(testsForSelectedDate);
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      showToast('Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchTests();
    setRefreshing(false);
  };

  const handleFinishTest = async (testId: string): Promise<void> => {
    try {
      // Find the test to get the product ID
      const test = activeTests.find(t => t._id === testId);
      if (!test) {
        showToast('Test not found', 'error');
        return;
      }

      // Set the selected test for completion and show modal
      setSelectedTestForCompletion({
        testId: testId,
        productId: test.itemID
      });
      setShowCompletionModal(true);

    } catch (error: any) {
      console.error('Error preparing test completion:', error);
      showToast('Failed to prepare test completion', 'error');
    }
  };

  const handleModalComplete = () => {
    // Refresh the test list after completion
    fetchTests();
    // Reset the selected test
    setSelectedTestForCompletion(null);
  };

  const handleModalClose = () => {
    setShowCompletionModal(false);
    setSelectedTestForCompletion(null);
  };

  const formatDateForHistory = (dateString: string): string => {
    const date = new Date(dateString);
    // Format: "3 Jun 2024"
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  const getProductName = (productId: string): string => {
    // Look up the product name from the sampleProducts array
    const product = sampleProducts.find((p: Product) => p.code === productId);
    
    if (product) {
      return product.product_name;
    }
    
    // Fallback if product not found
    return `Product ${productId.substring(0, 8)}...`;
  };

  // Convert completed tests to history items
  const historyItems: HistoryItem[] = completedTests.map((test: TestItem): HistoryItem => ({
    date: formatDateForHistory(test.finishDate),
    name: getProductName(test.itemID), // Get product name instead of ID
    status: test.result as 'Critic' | 'Safe' || 'Safe', // Default to 'Safe' if null
    notes: '', // No notes in the database structure
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.headerText}>Test</Text>

        {/* Calendar Component with See calendar link */}
        <View style={styles.calendarSection}>
          <TestCalendar 
            activeTests={activeTests}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <TouchableOpacity 
            style={styles.seeCalendarButton}
            onPress={() => router.push('/screens/FullCalendarScreen')}
          >
            <Text style={styles.seeCalendarText}>See calendar</Text>
            <Text style={styles.seeCalendarArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Active Tests Section */}
        <Text style={styles.sectionTitle}>
         Current test
        </Text>
        
        <TestItem 
          activeTests={filteredTests}
          loading={loading}
          handleFinishTest={handleFinishTest}
        />

        {/* History */}
        <View style={styles.historyContainer}>
          <Text style={[styles.sectionTitle, { marginTop: 0 }]}>History</Text>
          {historyItems.length > 0 ? (
            historyItems.map((item: HistoryItem, index: number) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={[
                    styles.historyStatus,
                    item.status === 'Critic' ? styles.criticStatus : styles.safeStatus
                  ]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.historyItemName}>{item.name}</Text>
                {item.notes && (
                  <Text style={styles.historyNotes}>{item.notes}</Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No test history</Text>
              <Text style={styles.emptySubtext}>
                Completed tests will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Test Completion Modal */}
      {selectedTestForCompletion && (
        <TestCompletionModal
          visible={showCompletionModal}
          onClose={handleModalClose}
          onComplete={handleModalComplete}
          testId={selectedTestForCompletion.testId}
          productId={selectedTestForCompletion.productId}
        />
      )}
    </SafeAreaView>
  );
}
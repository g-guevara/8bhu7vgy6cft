// app/components/Test/TestCalendar.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/TestStyles';
import { TestItem } from '../../screens/TestScreen';

interface DayItem {
  day: string;
  date: number;
  month: number;
  year: number;
  fullDate: Date;
  selected?: boolean;
  hasTest?: boolean;
  isToday?: boolean;
}

interface TestCalendarProps {
  activeTests: TestItem[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const TestCalendar: React.FC<TestCalendarProps> = ({ 
  activeTests, 
  selectedDate, 
  setSelectedDate 
}) => {
  const [calendarDays, setCalendarDays] = useState<DayItem[]>([]);
  
  // Generate calendar days starting from today and forward
  useEffect(() => {
    const today = new Date();
    
    // Generate an array for the next 7 days, starting with today
    const days: DayItem[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayItem: DayItem = {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        fullDate: new Date(date),
        selected: isSameDay(date, selectedDate),
        hasTest: false,
        isToday: i === 0 // Mark the first day as today
      };
      
      // Check if there are any tests for this day
      const hasTestOnDay = activeTests.some((test: TestItem) => {
        const testStartDate = new Date(test.startDate);
        const testFinishDate = new Date(test.finishDate);
        
        // Check if this day falls within the test period
        return (date >= testStartDate && date <= testFinishDate);
      });
      
      dayItem.hasTest = hasTestOnDay;
      days.push(dayItem);
    }
    
    setCalendarDays(days);
  }, [activeTests, selectedDate]);
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
  
  const handleDateSelect = (day: DayItem): void => {
    setSelectedDate(day.fullDate);
  };
  
  // Format date to display with leading zero if needed
  const formatDate = (date: number): string => {
    return date < 10 ? `0${date}` : `${date}`;
  };
  
  return (
    <View style={styles.calendarContainer}>
      {calendarDays.map((item: DayItem, index: number) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dayItem
          ]}
          onPress={() => handleDateSelect(item)}
        >
          <Text style={[
            styles.dayText,
            item.isToday ? styles.todayText : null
          ]}>
            {item.day}
          </Text>

          {/* Date Circle - Different styling based on if it's today, has test, or is selected */}
          {item.isToday ? (
            // Today's date - blue filled circle with white text
            <View style={styles.todayCircle}>
              <Text style={styles.todayDateText}>
                {formatDate(item.date)}
              </Text>
            </View>
          ) : item.selected ? (
            // Selected date - blue filled circle with white text (same as today)
            <View style={styles.selectedDateCircle}>
              <Text style={styles.selectedDateText}>
                {formatDate(item.date)}
              </Text>
            </View>
          ) : (
            // Regular date or date with test
            <View style={item.hasTest ? styles.testDateCircle : styles.dateCircle}>
              <Text style={styles.dateText}>
                {formatDate(item.date)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TestCalendar;
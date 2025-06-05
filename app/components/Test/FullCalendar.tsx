// app/components/Test/FullCalendar.tsx - Versión completa corregida
import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { styles } from '../../styles/FullCalendarStyles';
import { TestItem } from '../../screens/FullCalendarScreen';

interface CalendarDay {
  date: number;
  fullDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasTest: boolean;
  testType: 'active' | 'completed' | null;
  testResult: 'Critic' | 'Sensitive' | 'Safe' | null;
}

interface FullCalendarProps {
  currentDate: Date;
  tests: TestItem[];
  loading: boolean;
}

// Helper function to check if two dates are the same day - MOVED OUTSIDE COMPONENT
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const FullCalendar: React.FC<FullCalendarProps> = ({ 
  currentDate, 
  tests, 
  loading 
}) => {
  
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and how many days in month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Get days from previous month to fill the first week
    const daysFromPrevMonth: CalendarDay[] = [];
    if (firstDayWeekday > 0) {
      const prevMonth = new Date(year, month - 1, 0);
      const daysInPrevMonth = prevMonth.getDate();
      
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const date = daysInPrevMonth - i;
        const fullDate = new Date(year, month - 1, date);
        daysFromPrevMonth.push({
          date,
          fullDate,
          isCurrentMonth: false,
          isToday: false,
          hasTest: false,
          testType: null,
          testResult: null
        });
      }
    }
    
    // Get days for current month
    const today = new Date();
    const currentMonthDays: CalendarDay[] = [];
    
    for (let date = 1; date <= daysInMonth; date++) {
      const fullDate = new Date(year, month, date);
      const isToday = isSameDay(fullDate, today);
      
      // Check if this date has any tests
      const testForDay = tests.find(test => {
        const testStartDate = new Date(test.startDate);
        const testFinishDate = new Date(test.finishDate);
        
        // Check if this day falls within any test period
        return fullDate >= testStartDate && fullDate <= testFinishDate;
      });
      
      currentMonthDays.push({
        date,
        fullDate,
        isCurrentMonth: true,
        isToday,
        hasTest: !!testForDay,
        testType: testForDay ? (testForDay.completed ? 'completed' : 'active') : null,
        testResult: testForDay?.result || null
      });
    }
    
    // Get days from next month to fill the last week
    const totalDaysShown = daysFromPrevMonth.length + currentMonthDays.length;
    const daysFromNextMonth: CalendarDay[] = [];
    const daysNeeded = 42 - totalDaysShown; // 6 weeks * 7 days = 42
    
    for (let date = 1; date <= daysNeeded; date++) {
      const fullDate = new Date(year, month + 1, date);
      daysFromNextMonth.push({
        date,
        fullDate,
        isCurrentMonth: false,
        isToday: false,
        hasTest: false,
        testType: null,
        testResult: null
      });
    }
    
    return [...daysFromPrevMonth, ...currentMonthDays, ...daysFromNextMonth];
  }, [currentDate, tests]);
  
  // Get the style for a day based on its properties
  const getDayStyle = (day: CalendarDay): ViewStyle => {
    let dayStyle: ViewStyle = { ...styles.dayContainer };
    
    if (!day.isCurrentMonth) {
      dayStyle = { ...dayStyle, ...styles.otherMonthDay };
    }
    
    // Para días con fondo especial, aplicar los estilos que ya incluyen width, height y borderRadius
    if (day.isToday) {
      dayStyle = { ...dayStyle, ...styles.todayContainer };
    } else if (day.hasTest) {
      if (day.testType === 'active') {
        dayStyle = { ...dayStyle, ...styles.activeTestDay };
      } else if (day.testType === 'completed') {
        // Style based on test result
        if (day.testResult === 'Critic') {
          dayStyle = { ...dayStyle, ...styles.criticTestDay };
        } else if (day.testResult === 'Sensitive') {
          dayStyle = { ...dayStyle, ...styles.sensitiveTestDay };
        } else if (day.testResult === 'Safe') {
          dayStyle = { ...dayStyle, ...styles.safeTestDay };
        } else {
          dayStyle = { ...dayStyle, ...styles.completedTestDay };
        }
      }
    }
    
    return dayStyle;
  };
  
  const getDayTextStyle = (day: CalendarDay): TextStyle => {
    let textStyle: TextStyle = { ...styles.dayText };
    
    if (!day.isCurrentMonth) {
      textStyle = { ...textStyle, ...styles.otherMonthText };
    }
    
    if (day.isToday) {
      textStyle = { ...textStyle, ...styles.todayText };
    }
    
    if (day.hasTest && (day.isToday || day.testType === 'active' || day.testResult)) {
      textStyle = { ...textStyle, ...styles.testDayText };
    }
    
    return textStyle;
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.calendarContainer}>
      {/* Days of week header */}
      <View style={styles.weekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={styles.weekDayContainer}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={getDayStyle(day)}
            disabled={!day.hasTest}
          >
            <Text style={getDayTextStyle(day)}>
              {day.date}
            </Text>
            
            {/* Test indicator dot */}
            {day.hasTest && (
              <View style={styles.testIndicator}>
                <View style={[
                  styles.testDot,
                  day.testType === 'active' ? styles.activeTestDot :
                  day.testResult === 'Critic' ? styles.criticTestDot :
                  day.testResult === 'Sensitive' ? styles.sensitiveTestDot :
                  day.testResult === 'Safe' ? styles.safeTestDot :
                  styles.completedTestDot
                ]} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.activeTestDot]} />
            <Text style={styles.legendText}>Active Test</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.criticTestDot]} />
            <Text style={styles.legendText}>Critic</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.sensitiveTestDot]} />
            <Text style={styles.legendText}>Sensitive</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.safeTestDot]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FullCalendar;
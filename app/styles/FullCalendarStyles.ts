// app/styles/FullCalendarStyles.ts - Versión corregida y centrada
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#007AFF',
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  
  // Month navigation styles
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  
  // Scroll view
  scrollView: {
    flex: 1,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  
  // Calendar container
  calendarContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // Week header styles
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  // Day container styles - MEJORADOS Y CENTRADOS
  dayContainer: {
    width: '14.28%', // 100% / 7 days
    height: 50, // Altura fija en lugar de aspectRatio
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  otherMonthDay: {
    backgroundColor: 'transparent',
  },
  todayContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 25, // Más grande para hacer un círculo perfecto
    width: 36,
    height: 36,
  },
  activeTestDay: {
    backgroundColor: '#E8F0FF',
    borderRadius: 25,
    width: 36,
    height: 36,
  },
  completedTestDay: {
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    width: 36,
    height: 36,
  },
  criticTestDay: {
    backgroundColor: '#FFEBEE',
    borderRadius: 25,
    width: 36,
    height: 36,
  },
  sensitiveTestDay: {
    backgroundColor: '#FFF3E0',
    borderRadius: 25,
    width: 36,
    height: 36,
  },
  safeTestDay: {
    backgroundColor: '#E8F5E8',
    borderRadius: 25,
    width: 36,
    height: 36,
  },
  
  // Day text styles
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  otherMonthText: {
    color: '#ccc',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  testDayText: {
    fontWeight: '600',
  },
  
  // Test indicator styles - REPOSICIONADOS MEJOR
  testIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fff',
  },
  activeTestDot: {
    backgroundColor: '#007AFF',
  },
  completedTestDot: {
    backgroundColor: '#666',
  },
  criticTestDot: {
    backgroundColor: '#FF3B30',
  },
  sensitiveTestDot: {
    backgroundColor: '#FF9500',
  },
  safeTestDot: {
    backgroundColor: '#34C759',
  },
  
  // Legend styles
  legendContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    minWidth: '45%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});
// app/styles/FullCalendarStyles.ts - Versión completa actualizada
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
  
  // Legend styles - REMOVIDOS (reemplazados por compact legend)
  
  // Compact Legend Styles - NUEVO
  compactLegendContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  compactLegendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  compactLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  compactLegendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // All Tests Title
  allTestsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 15,
    marginHorizontal: 20,
    color: '#000',
  },

  // Compact History Styles - SIN SOMBRAS
  compactHistoryContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  compactHistoryList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  compactHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  compactHistoryLeft: {
    flex: 1,
    marginRight: 12,
  },
  compactHistoryRight: {
    alignItems: 'flex-end',
  },
  compactHistoryDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  compactHistoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  compactHistoryStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 1,
  },
  compactCriticStatus: {
    backgroundColor: '#fff5f5',
    borderColor: '#FF3B30',
  },
  compactSensitiveStatus: {
    backgroundColor: '#fffbf0',
    borderColor: '#FF9500',
  },
  compactSafeStatus: {
    backgroundColor: '#f0fff4',
    borderColor: '#34C759',
  },
  compactStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  compactCriticText: {
    color: '#FF3B30',
  },
  compactSensitiveText: {
    color: '#FF9500',
  },
  compactSafeText: {
    color: '#34C759',
  },
  timeAgoText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});
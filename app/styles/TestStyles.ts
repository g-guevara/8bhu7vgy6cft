import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    paddingVertical: 10,
  },
  dayItem: {
    alignItems: 'center',
    padding: 5,
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  todayText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  todayDateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 🔄 CÍRCULOS PERFECTOS PARA LAS FECHAS
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20, // ✅ Círculo perfecto (width/2)
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Sin background por defecto
  },
  selectedDateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20, // ✅ Círculo perfecto
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  testDateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20, // ✅ Círculo perfecto
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F0FF', // Light blue background
  },
  todayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20, // ✅ Círculo perfecto
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  currentTestContainer: {
    backgroundColor: '#E8F0FF',
    marginHorizontal: 20,
    marginBottom: 15, // ✅ Reducido de 30 a 15 para menos espacio
    borderRadius: 15,
    padding: 20,
  },
  currentTestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  currentTestSubtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  progressBarContainer: {
    marginVertical: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#D8E2F2',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  productName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  testDatesContainer: {
    marginVertical: 8,
  },
  testDateText: {
    fontSize: 12,
    color: '#666',
  },
  finishButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    bottom: 20,
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  historyItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  historyStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  criticStatus: {
    color: '#FF3B30',
  },
  safeStatus: {
    color: '#34C759',
  },
  historyNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  historyContainer: {
    backgroundColor: '#F5F5F7',
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: '#F5F5F7',
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Calendar section styles
  calendarSection: {
    position: 'relative',
  },
  seeCalendarButton: {
    position: 'absolute',
    right: 20,
    top: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeCalendarText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  seeCalendarArrow: {
    fontSize: 16,
    color: '#666',
  },
  
  // ✅ NOTIFICACIÓN DE LÍMITE DE TEST ACTUALIZADA
  testLimitNotification: {
    marginHorizontal: 20,
    marginTop: 5, // ✅ Reducido de 10 a 5 para menos padding
    marginBottom: 10, // ✅ Agregado para equilibrar el espaciado
    paddingHorizontal: 12, // ✅ Solo padding horizontal
    paddingVertical: 8, // ✅ Padding vertical mínimo
    // ✅ Sin backgroundColor (removido)
  },
  testLimitText: {
    fontSize: 12,
    color: '#8E8E93', // ✅ Cambiado de '#007AFF' a gris
    textAlign: 'center',
    fontStyle: 'italic', // ✅ Agregado para darle un toque más sutidsfsdfl
  },
});
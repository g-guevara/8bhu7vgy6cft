// app/styles/ProductInfoStyles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  placeholderEmoji: {
    fontSize: 100,
  },
  productInfoContainer: {
    padding: 16,
  },
  productNameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  productName: {
    fontSize: 38,
    fontWeight: 'bold',
  },
  organicLabel: {
    fontSize: 16,
    color: '#666',
    paddingLeft: 8,
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F5F5F5',
  },
  selectedReactionButton: {
    borderColor: '#007AFF',
    backgroundColor: '#E6F2FF',
  },
  reactionIcon: {
    marginRight: 8,
  },
  reactionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  criticDot: {
    backgroundColor: '#FF3B30',
  },
  sensitiveDot: {
    backgroundColor: '#FFCC00',
  },
  safeDot: {
    backgroundColor: '#34C759',
  },
  reactionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesInput: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  removeButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF5252',
  },
  removeButtonText: {
    color: '#D32F2F',
  },
  activeTestButton: {
    backgroundColor: '#E6F7FF',
    borderColor: '#1890FF',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 17,
    flex: 1,
  },
  ingredientsText: {
    flexWrap: 'wrap',
    marginRight: 10,
    lineHeight: 24,
  },
  saveNotesButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveNotesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  characterLimitContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  characterLimitText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  autoSaveText: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 10,
    fontStyle: 'italic',
  },

  // NEW STYLES FOR COLORED INGREDIENTS
  ingredientsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  ingredientTextCritic: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  ingredientTextSensitive: {
    color: '#F9A825',
    fontWeight: '600',
  },
  ingredientTextSafe: {
    color: '#388E3C',
    fontWeight: '600',
  },
  ingredientTextNeutral: {
    color: '#333',
  },
  ingredientsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  legendContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    minWidth: '48%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendColorCritic: {
    backgroundColor: '#D32F2F',
  },
  legendColorSensitive: {
    backgroundColor: '#F9A825',
  },
  legendColorSafe: {
    backgroundColor: '#388E3C',
  },
  legendColorNeutral: {
    backgroundColor: '#333',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
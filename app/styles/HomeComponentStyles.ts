// app/styles/HomeComponentStyles.ts
import { StyleSheet } from 'react-native';

// Main HomeScreen Styles
export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
  },
  profileButton: {
    marginTop: 7,
    padding: 8,
  },
  profileButtonText: {
    color: '#007BFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

// Search Component Styles
export const searchStyles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 17,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
  },
  resultsContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',

    marginBottom: 10,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',


  },
  productImageContainer: {
    width: 60,
    height: 60,

    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  productEmoji: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  productIngredients: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#999',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginTop: 10,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  noResultsSubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  }
});

// Categories Component Styles
export const categoryStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 80,
    paddingHorizontal: 10,
  },
  categoryItem: {
    width: '48%',
    height: 120,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  categoryText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
loadingContainer: {
  padding: 20,
  alignItems: 'center',
},

});
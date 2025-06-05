import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  
  profileButton: {
    marginTop:7,
    padding: 8,
  },
  
  headerText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
  },
  productText: {
    fontSize: 18,
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#999',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 80,
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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 70,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    color: '#999',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activeTab: {
    color: '#007AFF',
  },
  activeTabText: {
    color: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#999',
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
  searchResultsContainer: {
    marginTop: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e8e8e8',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  searchResultContent: {
    flex: 1,
    marginRight: 10,
  },
  searchResultText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  searchResultBrand: {
    fontSize: 14,
    color: '#666',
  },
  searchResultCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
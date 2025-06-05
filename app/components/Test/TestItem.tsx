// app/components/Test/TestItem.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { styles } from '../../styles/TestStyles';
import { sampleProducts } from '../../data/productData';

interface TestItemProps {
  activeTests: any[];
  loading: boolean;
  handleFinishTest: (testId: string) => void;
}

const TestItem: React.FC<TestItemProps> = ({ 
  activeTests, 
  loading, 
  handleFinishTest 
}) => {
  
  const formatRemainingTime = (test: any) => {
    const now = new Date();
    const finishDate = new Date(test.finishDate);
    const diffTime = finishDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return '0 days, 0 hours';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${diffDays} days, ${diffHours} hours`;
  };

  const getProductName = (productId: string) => {
    // Look up the product name from the sampleProducts array
    const product = sampleProducts.find(p => p.code === productId);
    
    if (product) {
      return product.product_name;
    }
    
    // Fallback if product not found
    return `Product ${productId.substring(0, 8)}...`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (activeTests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active tests</Text>
        <Text style={styles.emptySubtext}>
        ⓘ Conduct a trial by testing your reaction to specific foods. Eat only one food at a time and allow a full digestion cycle to pass (3 to 5 days for an adult) to isolate its effects from other potential factors. If you experience an adverse reaction, it is recommended to wait 6 days before starting a new trial.
        </Text>
      </View>
    );
  }

  return (
    <>
      {activeTests.map((test) => (
        <View key={test._id} style={styles.currentTestContainer}>
          <Text style={styles.currentTestTitle}>
            Finish on {new Date(test.finishDate).toLocaleDateString()}
          </Text>
          <Text style={styles.currentTestSubtitle}>
            {formatRemainingTime(test)} remain
          </Text>
          <Text style={styles.productName}>
            Product: {getProductName(test.itemID)}
          </Text>
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={() => handleFinishTest(test._id)}
          >
            <Text style={styles.finishButtonText}>Finish →</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {/* New notification about one test at a time */}
      <View style={styles.testLimitNotification}>
        <Text style={styles.testLimitText}>
          ⓘ Only one test can be performed at a time
        </Text>
      </View>
    </>
  );
};

export default TestItem;
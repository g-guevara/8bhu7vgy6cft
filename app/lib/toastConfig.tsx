// app/utils/toastConfig.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const toastConfig = {
  error: ({ text1, text2 }: CustomToastProps) => (
    <View style={styles.errorContainer}>
      {text1 && (
        <Text style={styles.errorText}>
          {text1}
        </Text>
      )}
      {text2 && <Text style={styles.errorSubtext}>{text2}</Text>}
    </View>
  ),
  success: ({ text1, text2 }: CustomToastProps) => (
    <View style={styles.successContainer}>
      {text1 && (
        <Text style={styles.successText}>
          {text1}
        </Text>
      )}
      {text2 && <Text style={styles.successSubtext}>{text2}</Text>}
    </View>
  ),
  warning: ({ text1, text2 }: CustomToastProps) => (
    <View style={styles.warningContainer}>
      {text1 && (
        <Text style={styles.warningText}>
          {text1}
        </Text>
      )}
      {text2 && <Text style={styles.warningSubtext}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '90%',
    height: 52,
    borderWidth: 1,
    borderColor: '#D92D20',
    backgroundColor: '#FEF3F2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#D92D20',
    fontSize: 12,
    fontWeight: '600',
  },
  errorSubtext: {
    color: '#D92D20',
    fontSize: 12,
    marginLeft: 5,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '90%',
    height: 52,
    borderWidth: 1,
    borderColor: '#ABEFC6',
    backgroundColor: '#ECFDF3',
    padding: 12,
    borderRadius: 8,
  },
  successText: {
    color: '#067647',
    fontSize: 12,
    fontWeight: '600',
  },
  successSubtext: {
    color: '#067647',
    fontSize: 12,
    marginLeft: 5,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '90%',
    height: 52,
    borderWidth: 1,
    borderColor: '#F79009',
    backgroundColor: '#FFFAEB',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    color: '#B54708',
    fontSize: 12,
    fontWeight: '600',
  },
  warningSubtext: {
    color: '#B54708',
    fontSize: 12,
    marginLeft: 5,
  },
});

export default toastConfig;
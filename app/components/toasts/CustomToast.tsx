// app/components/Toast/CustomToast.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
  onHide: () => void;
}

const { width } = Dimensions.get('window');

export const CustomToast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  duration = 3000,
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  const getStyleByType = () => {
    switch (type) {
      case 'success':
        return {
          container: styles.successContainer,
          text: styles.successText,
        };
      case 'error':
        return {
          container: styles.errorContainer,
          text: styles.errorText,
        };
      case 'warning':
        return {
          container: styles.warningContainer,
          text: styles.warningText,
        };
      default:
        return {
          container: styles.defaultContainer,
          text: styles.defaultText,
        };
    }
  };

  const typeStyles = getStyleByType();

  return (
    <Animated.View
      style={[
        styles.container,
        typeStyles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={[styles.text, typeStyles.text]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    maxWidth: width - 40,
    zIndex: 9999,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  defaultContainer: {
    backgroundColor: '#333',
  },
  defaultText: {
    color: '#fff',
  },
  successContainer: {
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#ABEFC6',
  },
  successText: {
    color: '#067647',
  },
  errorContainer: {
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#D92D20',
  },
  errorText: {
    color: '#D92D20',
  },
  warningContainer: {
    backgroundColor: '#FFFAEB',
    borderWidth: 1,
    borderColor: '#F79009',
  },
  warningText: {
    color: '#B54708',
  },
});
// app/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import ProfileScreen from './ProfileScreen';
import { useToast } from '../utils/ToastContext';
import { useOnboarding } from '../utils/OnboardingContext';
import SearchComponent from '../components/Home/SearchComponent';
import CategoriesComponent from '../components/Home/CategoriesComponent';
import { homeStyles } from '../styles/HomeComponentStyles';
import { Svg, Path } from 'react-native-svg';
import Icon from "react-native-vector-icons/Ionicons";

interface User {
  id?: string;
  name?: string;
  email?: string;
  language?: string;
  trialPeriodDays?: number;
}

interface HomeScreenProps {
  user?: User;
  onLogout?: () => void;
}

export default function HomeScreen({ user, onLogout }: HomeScreenProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { showToast } = useToast();
  const { resetOnboardingForTutorial } = useOnboarding();

  const handleRepeatTutorial = () => {
    console.log('🔄 Repeat Tutorial button pressed'); // Debug log
    
    try {
      showToast('Starting tutorial...', 'success');
      
      // Llamar la función para resetear el onboarding inmediatamente
      resetOnboardingForTutorial();
      
      console.log('✅ resetOnboardingForTutorial called successfully'); // Debug log
    } catch (error) {
      console.error('❌ Error in handleRepeatTutorial:', error);
      showToast('Error starting tutorial', 'error');
    }
  };

  return (
    <SafeAreaView style={homeStyles.container}>
      <ScrollView style={homeStyles.scrollView}>
        <View style={homeStyles.headerContainer}>
          <Text style={homeStyles.headerText}>Home</Text>
          <TouchableOpacity style={homeStyles.profileButton} onPress={() => setShowProfile(true)}>
            <Text style={homeStyles.profileButtonText}></Text>
            <Icon name="person" size={35} color=" #000 "/>
          </TouchableOpacity>
        </View>

        <SearchComponent 
          onFocusChange={setIsSearchFocused}
        />

        {!isSearchFocused && (
          <>
            <CategoriesComponent />
            
            {/* 🔥 BOTÓN REPEAT TUTORIAL CORREGIDO */}
            <View style={{ marginTop: 20, marginBottom: 30 }}>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#007AFF',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginHorizontal: 20,
                }}
                onPress={handleRepeatTutorial}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Repeat Tutorial
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {showProfile && user && (
        <ProfileScreen
          user={{
            _id: user.id || '',
            userID: user.id || '',
            name: user.name || '',
            email: user.email || '',
            language: user.language || 'en',
            trialPeriodDays: user.trialPeriodDays || 5,
          }}
          onLogout={() => {
            setShowProfile(false);
            onLogout?.();
          }}
          onClose={() => setShowProfile(false)}
        />
      )}
    </SafeAreaView>
  );
}
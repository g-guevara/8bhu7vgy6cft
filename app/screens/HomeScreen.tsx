// app/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import ProfileScreen from './ProfileScreen';
import { useToast } from '../utils/ToastContext';
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

  return (
    <SafeAreaView style={homeStyles.container}>
      <ScrollView style={homeStyles.scrollView}>
        <View style={homeStyles.headerContainer}>
          <Text style={homeStyles.headerText}>Home</Text>
          <TouchableOpacity style={homeStyles.profileButton} onPress={() => setShowProfile(true)}>
            <Text style={homeStyles.profileButtonText}></Text>
                          {/* <Svg width={50} height={50} viewBox="0 0 24 24" fill="#000000">
                            <Path 
                              fillRule="evenodd" 
                              d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" 
                              clipRule="evenodd" 
                            />
                          </Svg> */}
                                      <Icon name="person" size={35} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>

        <SearchComponent 
          onFocusChange={setIsSearchFocused}
        />

        {!isSearchFocused && (
          <CategoriesComponent />
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
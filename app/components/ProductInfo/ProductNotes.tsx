// app/components/ProductInfo/ProductNotes.tsx
// Version: 1.1.0

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/ProductInfoStyles';

interface ProductNotesProps {
  notes: string;
  setNotes: (notes: string) => void;
  onSaveNotes: () => void;
  isSaving: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved';
  characterLimit?: number;
}

const ProductNotes: React.FC<ProductNotesProps> = ({ 
  notes, 
  setNotes, 
  onSaveNotes,
  isSaving,
  autoSaveStatus,
  characterLimit = 500 // Default character limit
}) => {
  
  const handleChangeText = (text: string) => {
    // Only allow text within character limit
    if (text.length <= characterLimit) {
      setNotes(text);
    }
  };

  const getRemainingCharacters = () => {
    return characterLimit - notes.length;
  };
  
  const getCharacterLimitColor = () => {
    const remaining = getRemainingCharacters();
    if (remaining < 20) return '#FF3B30'; // Red when close to limit
    if (remaining < 50) return '#FF9500'; // Orange when approaching limit
    return '#8E8E93'; // Default gray
  };

  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {autoSaveStatus === 'saving' && (
            <Text style={styles.autoSaveText}>Saving...</Text>
          )}
          {autoSaveStatus === 'saved' && (
            <Text style={styles.autoSaveText}>Saved</Text>
          )}

        </View>
      </View>
      <TextInput
        style={styles.notesInput}
        multiline
        placeholder="Add your notes about this product here..."
        value={notes}
        onChangeText={handleChangeText}
      />

    </>
  );
};

export default ProductNotes;
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text as RNText } from 'react-native'; 
import { Text } from '@/components/shared/Text';

// A simple Text component to ensure consistency, similar to your existing setup

interface SearchInputProps {
  onSearch: (text: string) => void;
  placeholder?: string;
  initialValue?: string;
  borderColor?: string; // For the outer border/highlight
  focusedBorderColor?: string; // For the outer border/highlight when focused
}

const SearchBar: React.FC<SearchInputProps> = ({ 
  onSearch, 
  placeholder = "Search ...", 
  initialValue = "",
  borderColor = '#2A2A4A', // Default subtle border color
  focusedBorderColor = '#5A5AF5', // Default blue/purple focus color
}) => {
  const [searchText, setSearchText] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchText('');
    onSearch(''); // Notify parent that search text is cleared
  };

  const currentBorderColor = isFocused ? focusedBorderColor : borderColor;

  return (
    <View style={[styles.container, { borderColor: currentBorderColor }]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888" // Lighter grey for placeholder
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          onSearch(text); // Call the onSearch prop on every text change
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        cursorColor="#FFD700" // Yellow caret
        selectionColor="#FFD70050" // A lighter yellow when selecting text
      />

      {searchText.length > 0 && (
        <Pressable style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>×</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000', // Black background for the search box
    borderRadius: 30, // Highly rounded corners
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2, // Outer border
    width: '90%', // Adjust width as needed
    alignSelf: 'center', // Center the component if not in a flex container
    marginTop: 20, // Example margin
  },
  input: {
    flex: 1, // Take up all available space
    height: 40, // Fixed height for the input field
    color: '#FFF', // White text for input
    fontSize: 18,
    // fontFamily: 'Inter', // Apply a specific font if you have it loaded
    paddingRight: 10, // Space between text and clear button
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 15, // Perfect circle
    backgroundColor: '#FF69B4', // Pink background
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Space from text input
  },
  clearButtonText: {
    color: '#FFF', // White 'x'
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20, // Adjust line height to center 'x' vertically
    textAlignVertical: 'center', // Helps with vertical alignment on Android
  },
});

export default SearchBar;
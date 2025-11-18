import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native'; 
import { Text } from '@/components/shared/Text';
import { useAppTheme } from '@/stores/app-theme-context';

interface SearchInputProps {
  onSearch: (text: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchInputProps> = ({ 
  onSearch, 
  placeholder = "Search ...", 
  initialValue = "",
}) => {
  const { theme } = useAppTheme();
  const { colors, palette } = theme;
  const [searchText, setSearchText] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <View style={[
      styles.container, 
      { 
        borderColor: palette.white, // Always white border
        backgroundColor: theme.isDark ? palette.black : palette.white
      }
    ]}>
      <TextInput
        style={[
          styles.input,
          { 
            color: theme.isDark ? palette.white : palette.black,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.isDark ? palette.beige : palette.darkBlue}
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          onSearch(text);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        cursorColor={palette.yellow}
        selectionColor={`${palette.yellow}50`}
      />

      {searchText.length > 0 && (
        <Pressable 
          style={[
            styles.clearButton, 
            { backgroundColor: palette.pink }
          ]} 
          onPress={handleClear}
        >
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
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderWidth: 1,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    minHeight: 60,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 18,
    paddingRight: 10,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 20,
    textAlignVertical: 'center',
  },
});

export default SearchBar;
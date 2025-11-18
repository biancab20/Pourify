import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/shared/Text';
import { useAppTheme } from '@/stores/app-theme-context'; // Updated import path

interface WideCardStaticProps {
  children: React.ReactNode;
  style?: any;
}

const WideCardStatic: React.FC<WideCardStaticProps> = ({ children, style }) => {
  const { theme } = useAppTheme();

  return (
    <View 
      style={[
        styles.wideCardBackground, 
        { 
          backgroundColor: theme.colors.cardBackground,
          color: theme.colors.text,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wideCardBackground: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
});

export default WideCardStatic;
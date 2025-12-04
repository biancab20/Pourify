import React from 'react';
import { Pressable, StyleSheet, GestureResponderEvent, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Text } from '@/components/shared/Text';

interface SecondaryButtonProps {
  destination?: string;
  params?: Record<string, any>;
  buttonText?: string;
  onPress?: (event: GestureResponderEvent) => void;
  gradientName?: 'paloma' | 'bananaDaiquiri';
  backgroundColor?: string;
  style?: any; // Add style prop for custom styling
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ 
  destination, 
  params = {}, 
  buttonText = "Button",
  onPress,
  gradientName = 'paloma',
  backgroundColor = '#001b3a',
  style,
}) => {
  const router = useRouter();

  const handlePress = (event: GestureResponderEvent) => {
    if (onPress) {
      onPress(event);
    } else if (destination) {
      router.push({
        pathname: destination as any,
        params
      });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        style, // Allow custom styling
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={gradientName === 'paloma' ? ["#FF77E0", "#F54D41"] : ["#D9E734", "#00C264"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBorder}
      >
        <View style={[styles.buttonInner, { backgroundColor }]}>
          <Text 
            variant="gradient" 
            gradientName={gradientName}
            style={styles.buttonText}
          >
            {buttonText}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52, // Fixed height
    borderRadius: 12,
  },
  gradientBorder: {
    flex: 1,
    padding: 2,
    borderRadius: 24,
  },
  buttonInner: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});

export default SecondaryButton;
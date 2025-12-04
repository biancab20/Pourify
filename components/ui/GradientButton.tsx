import React from 'react';
import { Pressable, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface GradientButtonProps {
  destination?: string;
  params?: Record<string, any>;
  buttonText?: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  destination, 
  params = {}, 
  buttonText = "View stock",
  onPress,
  disabled = false
}) => {
  const router = useRouter();

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;
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
      disabled={disabled}
      style={({ pressed }) => [
        styles.stockButton,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={["#FF77E0", "#F54D41"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          styles.gradient,
          disabled && styles.disabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {buttonText}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  stockButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  gradient: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  }
});

export default GradientButton;
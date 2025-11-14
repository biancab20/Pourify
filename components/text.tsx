import { Text as RNText, TextProps } from "react-native";

export function Text(props: TextProps) {
  return (
    <RNText
      {...props}
      style={[{ fontFamily: "Roobert" }, props.style]} // Apply Roobert globally
    >
      {props.children}
    </RNText>
  );
}

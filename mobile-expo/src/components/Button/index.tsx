import React from "react";
import {
  ActivityIndicator,
  ColorValue,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { styles } from "./styles";

type ButtonProps = TouchableOpacityProps & {
  title: string;
  color: ColorValue;
  backgroundColor: ColorValue;
  icon?: React.ComponentProps<typeof AntDesign>["name"];
  isLoading?: boolean;
};

export function Button({
  title,
  color,
  backgroundColor,
  icon,
  isLoading = false,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <AntDesign name={icon} size={24} styles={styles.icon} />
          <Text style={[styles.title, { color }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

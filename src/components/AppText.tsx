import { PropsWithChildren } from "react";
import { StyleSheet, Text, TextProps } from "react-native";

import { colors } from "@/styles/theme";

type AppTextProps = PropsWithChildren<
  TextProps & {
    variant?: "title" | "subtitle" | "body" | "caption" | "metric";
    muted?: boolean;
  }
>;

export function AppText({ children, style, variant = "body", muted, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        styles.base,
        styles[variant],
        muted ? styles.muted : null,
        style
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    letterSpacing: 0
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 35
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25
  },
  body: {
    fontSize: 15,
    lineHeight: 22
  },
  caption: {
    fontSize: 12,
    lineHeight: 17
  },
  metric: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40
  },
  muted: {
    color: colors.muted
  }
});


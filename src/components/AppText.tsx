import { PropsWithChildren } from "react";
import { Platform, StyleSheet, Text, TextProps } from "react-native";

import { colors, typography } from "@/styles/theme";

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
    color: colors.inkSecondary,
    fontFamily: Platform.select({ web: typography.fontSans, default: undefined }),
    letterSpacing: 0
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 38
  },
  subtitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 27
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 27
  },
  caption: {
    fontSize: 12,
    lineHeight: 18
  },
  metric: {
    color: colors.ink,
    fontFamily: Platform.select({ web: typography.fontMono, default: undefined }),
    fontSize: 34,
    fontWeight: "500",
    lineHeight: 42
  },
  muted: {
    color: colors.inkTertiary
  }
});

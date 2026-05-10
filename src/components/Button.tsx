import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { colors, radii, spacing } from "@/styles/theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
};

export function Button({ label, onPress, icon: Icon, variant = "primary", disabled }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null
      ]}
    >
      <View style={styles.inner}>
        {Icon ? (
          <Icon
            color={variant === "primary" || variant === "danger" ? colors.surface : colors.primary}
            size={20}
          />
        ) : null}
        <AppText
          style={[
            styles.label,
            variant === "primary" || variant === "danger" ? styles.labelOnDark : null
          ]}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radii.sm,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderWidth: 1
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: colors.danger
  },
  disabled: {
    opacity: 0.5
  },
  pressed: {
    opacity: 0.82
  },
  label: {
    color: colors.primary,
    fontWeight: "800"
  },
  labelOnDark: {
    color: colors.surface
  }
});


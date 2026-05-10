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
          <Icon color={variant === "primary" ? colors.surface : getButtonForeground(variant)} size={18} />
        ) : null}
        <AppText
          style={[
            styles.label,
            variant === "primary" ? styles.labelOnDark : null,
            variant === "danger" ? styles.labelDanger : null,
            variant === "ghost" ? styles.labelGhost : null
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
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  primary: {
    backgroundColor: colors.ink
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: colors.spotWarmBg,
    borderColor: colors.spotWarm,
    borderWidth: 1
  },
  disabled: {
    opacity: 0.5
  },
  pressed: {
    opacity: 0.82
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "500"
  },
  labelOnDark: {
    color: colors.surface
  },
  labelDanger: {
    color: colors.spotWarm
  },
  labelGhost: {
    color: colors.inkSecondary
  }
});

function getButtonForeground(variant: NonNullable<ButtonProps["variant"]>) {
  if (variant === "danger") return colors.spotWarm;
  if (variant === "ghost") return colors.inkSecondary;
  return colors.ink;
}

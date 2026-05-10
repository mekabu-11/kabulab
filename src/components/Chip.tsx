import { PropsWithChildren } from "react";
import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/AppText";
import { colors, radii, spacing } from "@/styles/theme";

type ChipProps = PropsWithChildren<{
  selected?: boolean;
  danger?: boolean;
  onPress: () => void;
}>;

export function Chip({ children, selected, danger, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.chip,
        danger ? styles.danger : null,
        selected ? (danger ? styles.dangerSelected : styles.selected) : null
      ]}
    >
      <AppText
        style={[
          styles.label,
          selected ? styles.selectedLabel : null,
          danger && selected ? styles.dangerSelectedLabel : null
        ]}
      >
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: "center"
  },
  selected: {
    backgroundColor: colors.spotCoolBg,
    borderColor: colors.spotCool
  },
  danger: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  dangerSelected: {
    backgroundColor: colors.spotWarmBg,
    borderColor: colors.spotWarm
  },
  label: {
    color: colors.inkSecondary,
    fontWeight: "500"
  },
  selectedLabel: {
    color: colors.spotCool
  },
  dangerSelectedLabel: {
    color: colors.spotWarm
  }
});

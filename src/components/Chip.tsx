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
      style={[styles.chip, selected ? styles.selected : null, danger ? styles.danger : null]}
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
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: "center"
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  danger: {
    borderColor: "#E7A095"
  },
  label: {
    color: colors.text,
    fontWeight: "700"
  },
  selectedLabel: {
    color: colors.surface
  },
  dangerSelectedLabel: {
    color: colors.surface
  }
});


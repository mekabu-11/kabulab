import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { AppText } from "@/components/AppText";
import { colors, radii, spacing } from "@/styles/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  helper?: string;
};

export function FormField({ label, helper, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, props.multiline ? styles.multiline : null, style]}
        {...props}
      />
      {helper ? (
        <AppText variant="caption" muted>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  label: {
    color: colors.muted,
    fontWeight: "700"
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top"
  }
});


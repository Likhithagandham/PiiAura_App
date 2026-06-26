import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { AlertTriangle, CheckCircle2, Save } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SavePreferencesButtonProps {
  label: string;
  footnote: string;
  onSave: () => Promise<void>;
}

export function SavePreferencesButton({ label, footnote, onSave }: SavePreferencesButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePress = async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, saved && styles.buttonSaved]}
        onPress={handlePress}
        disabled={saving || saved}
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Preferences saved' : label}
        accessibilityState={{ disabled: saving || saved, busy: saving }}
      >
        {saving ? (
          <>
            <ActivityIndicator color={colors.white} size="small" />
            <Text style={styles.buttonText}>Updating...</Text>
          </>
        ) : saved ? (
          <>
            <CheckCircle2 size={20} color="#FF972C" />
            <Text style={[styles.buttonText, styles.buttonTextSaved]}>Preferences Saved</Text>
          </>
        ) : (
          <>
            <Save size={20} color={colors.white} />
            <Text style={styles.buttonText}>{label}</Text>
          </>
        )}
      </Pressable>
      <Text style={styles.footnote}>{footnote}</Text>
    </View>
  );
}

interface PrivacyControlCardProps {
  title: string;
  description: string;
}

export function PrivacyControlCard({ title, description }: PrivacyControlCardProps) {
  return (
    <View style={styles.privacyCard}>
      <View style={styles.privacyTitleRow}>
        <AlertTriangle size={16} color={colors.error} />
        <Text style={styles.privacyTitle}>{title}</Text>
      </View>
      <Text style={styles.privacyDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSaved: {
    backgroundColor: '#683700',
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  buttonTextSaved: {
    color: '#FF972C',
  },
  footnote: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    letterSpacing: 0.3,
  },
  privacyCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.2)',
    backgroundColor: 'rgba(255,218,214,0.1)',
    gap: spacing.sm,
  },
  privacyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  privacyTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    letterSpacing: 0.5,
  },
  privacyDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});

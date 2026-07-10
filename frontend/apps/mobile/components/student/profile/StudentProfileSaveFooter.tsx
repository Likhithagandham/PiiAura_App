import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Save, CheckCircle } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentProfileSaveFooterProps {
  saveLabel: string;
  lastUpdatedLabel: string;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}

export function StudentProfileSaveFooter({
  saveLabel,
  lastUpdatedLabel,
  saving,
  saved,
  onSave,
}: StudentProfileSaveFooterProps) {
  return (
    <View style={styles.footer}>
      <Pressable
        style={[styles.saveBtn, saved && styles.saveBtnSuccess, saving && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={saving || saved}
      >
        {saving ? (
          <>
            <ActivityIndicator size="small" color={colors.white} />
            <Text style={styles.saveBtnText}>Updating...</Text>
          </>
        ) : saved ? (
          <>
            <CheckCircle size={20} color="#FF972C" />
            <Text style={[styles.saveBtnText, styles.saveBtnTextSuccess]}>Changes Saved</Text>
          </>
        ) : (
          <>
            <Save size={20} color={colors.white} />
            <Text style={styles.saveBtnText}>{saveLabel}</Text>
          </>
        )}
      </Pressable>
      <Text style={styles.lastUpdated}>{lastUpdatedLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#00342B',
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnSuccess: {
    backgroundColor: '#683700',
  },
  saveBtnDisabled: {
    opacity: 0.85,
  },
  saveBtnText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  saveBtnTextSuccess: {
    color: '#FF972C',
  },
  lastUpdated: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

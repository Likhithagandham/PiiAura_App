import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FunctionSquare } from 'lucide-react-native';
import type { FacultySyllabusFocus } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SyllabusFocusCardProps {
  focus: FacultySyllabusFocus;
  onUpdateTopics?: () => void;
}

export function SyllabusFocusCard({ focus, onUpdateTopics }: SyllabusFocusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CURRENT FOCUS</Text>
        <Text style={styles.subject}>{focus.subjectLabel}</Text>

        <View style={styles.percentRow}>
          <Text style={styles.percent}>{focus.percent}%</Text>
          <Text style={styles.percentLabel}>Syllabus completion</Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${focus.percent}%` }]} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.nextChapter}>{focus.nextChapter}</Text>
          <Pressable style={styles.updateBtn} onPress={onUpdateTopics}>
            <Text style={styles.updateBtnText}>{focus.updateTopicsLabel}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.watermark}>
        <FunctionSquare size={120} color="rgba(255,255,255,0.1)" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    zIndex: 1,
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(126,189,172,0.9)',
    letterSpacing: 1,
  },
  subject: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#7EBDAC',
    marginBottom: spacing.sm,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  percent: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#7EBDAC',
  },
  percentLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(126,189,172,0.9)',
  },
  track: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,52,43,0.3)',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: '#AFEFDD',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  nextChapter: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#7EBDAC',
  },
  updateBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  updateBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  watermark: {
    position: 'absolute',
    right: -16,
    bottom: -16,
  },
});

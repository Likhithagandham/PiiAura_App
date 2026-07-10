import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Hourglass } from 'lucide-react-native';
import type { StudentExamSubjectBreakdown } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentExamsBreakdownListProps {
  title: string;
  subjects: StudentExamSubjectBreakdown[];
}

function SubjectSparkline({
  path,
  fillPath,
  strokeColor,
  fillColor,
}: {
  path: string;
  fillPath: string;
  strokeColor: string;
  fillColor: string;
}) {
  return (
    <Svg width={96} height={48} viewBox="0 0 100 40">
      <Path d={fillPath} fill={fillColor} />
      <Path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BreakdownCard({ subject }: { subject: StudentExamSubjectBreakdown }) {
  if (subject.pendingMessage) {
    return (
      <View style={[styles.card, subject.dimmed && styles.cardDimmed]}>
        <View style={styles.cardContent}>
          <View style={styles.textBlock}>
            <Text style={[styles.subjectName, subject.dimmed && styles.subjectNameMuted]}>
              {subject.subject}
            </Text>
            <Text style={styles.pendingMessage}>{subject.pendingMessage}</Text>
          </View>
          <View style={styles.pendingIcon}>
            <Hourglass size={28} color={colors.textSecondary} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.textBlock}>
          <Text style={styles.subjectName}>{subject.subject}</Text>
          <View style={styles.badgeRow}>
            {subject.unitScores?.map((score) => (
              <View
                key={score.unitLabel}
                style={[styles.badge, score.isActive ? styles.badgeActive : styles.badgeInactive]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    score.isActive ? styles.badgeTextActive : styles.badgeTextInactive,
                  ]}
                >
                  {score.unitLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <SubjectSparkline
          path={subject.sparklinePath}
          fillPath={subject.sparklineFillPath}
          strokeColor={subject.strokeColor}
          fillColor={subject.fillColor}
        />
      </View>
    </View>
  );
}

export function StudentExamsBreakdownList({ title, subjects }: StudentExamsBreakdownListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {subjects.map((subject) => (
          <BreakdownCard key={subject.id} subject={subject} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    paddingHorizontal: 4,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  cardDimmed: {
    opacity: 0.8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.sm,
  },
  subjectName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subjectNameMuted: {
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeActive: {
    backgroundColor: colors.primaryContainer,
  },
  badgeInactive: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  badgeTextActive: {
    color: '#7EBDAC',
  },
  badgeTextInactive: {
    color: colors.textSecondary,
  },
  pendingMessage: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    fontStyle: 'italic',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  pendingIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

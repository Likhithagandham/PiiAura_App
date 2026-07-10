import { StyleSheet, Text, View } from 'react-native';
import { Info, Eye } from 'lucide-react-native';
import type { FacultyStudyMaterialTip } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudyMaterialTipsProps {
  tips: FacultyStudyMaterialTip[];
}

const TIP_STYLES = {
  info: {
    bg: colors.secondaryContainer,
    text: '#576867',
    Icon: Info,
  },
  visibility: {
    bg: '#FFDCC2',
    text: '#6D3A00',
    Icon: Eye,
  },
} as const;

export function StudyMaterialTips({ tips }: StudyMaterialTipsProps) {
  return (
    <View style={styles.grid}>
      {tips.map((tip) => {
        const style = TIP_STYLES[tip.variant];
        const Icon = style.Icon;

        return (
          <View key={tip.id} style={[styles.tile, { backgroundColor: style.bg }]}>
            <Icon size={22} color={style.text} />
            <Text style={[styles.text, { color: style.text }]}>{tip.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});

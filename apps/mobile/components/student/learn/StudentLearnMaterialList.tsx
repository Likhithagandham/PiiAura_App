import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Download, FileText, FileType } from 'lucide-react-native';
import type { StudentLearnMaterialItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLearnMaterialListProps {
  title: string;
  viewAllLabel: string;
  materials: StudentLearnMaterialItem[];
  onViewAll?: () => void;
  onDownload?: (id: string) => void;
}

function MaterialIcon({ fileType }: { fileType: StudentLearnMaterialItem['fileType'] }) {
  if (fileType === 'pdf') {
    return (
      <View style={[styles.iconWrap, styles.iconPdf]}>
        <FileType size={22} color="#BA1A1A" />
      </View>
    );
  }
  return (
    <View style={[styles.iconWrap, styles.iconDoc]}>
      <FileText size={22} color={colors.primaryContainer} />
    </View>
  );
}

export function StudentLearnMaterialList({
  title,
  viewAllLabel,
  materials,
  onViewAll,
  onDownload,
}: StudentLearnMaterialListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>{viewAllLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {materials.map((material) => (
          <Pressable
            key={material.id}
            style={styles.row}
            onPress={() => onDownload?.(material.id)}
          >
            <MaterialIcon fileType={material.fileType} />
            <View style={styles.meta}>
              <Text style={styles.materialTitle}>{material.title}</Text>
              <Text style={styles.materialSubtitle}>
                {material.fileType.toUpperCase()} • {material.sizeLabel} • {material.updatedLabel}
              </Text>
            </View>
            <Download size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  viewAll: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
    letterSpacing: 0.5,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPdf: {
    backgroundColor: '#FFDAD6',
  },
  iconDoc: {
    backgroundColor: colors.secondaryContainer,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  materialTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  materialSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
});

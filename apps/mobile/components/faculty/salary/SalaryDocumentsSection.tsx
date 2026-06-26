import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Download, Share2, FileText, PiggyBank } from 'lucide-react-native';
import type { FacultySalaryDocument } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SalaryDocumentsSectionProps {
  title: string;
  documents: FacultySalaryDocument[];
  onAction?: (document: FacultySalaryDocument, action: 'download' | 'share') => void;
}

const ICONS = {
  form16: FileText,
  pf: PiggyBank,
} as const;

const ICON_BG = {
  form16: '#FFDCC2',
  pf: '#D4E6E5',
} as const;

const ICON_COLOR = {
  form16: '#482400',
  pf: colors.primary,
} as const;

export function SalaryDocumentsSection({
  title,
  documents,
  onAction,
}: SalaryDocumentsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {documents.map((doc) => {
          const Icon = ICONS[doc.variant];
          return (
            <View key={doc.id} style={styles.card}>
              <View style={styles.left}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: ICON_BG[doc.variant] },
                  ]}
                >
                  <Icon size={22} color={ICON_COLOR[doc.variant]} />
                </View>
                <View>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                {doc.actions.includes('share') ? (
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => onAction?.(doc, 'share')}
                  >
                    <Share2 size={18} color={colors.primary} />
                  </Pressable>
                ) : null}
                {doc.actions.includes('download') ? (
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => onAction?.(doc, 'download')}
                  >
                    <Download size={18} color={colors.primary} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  docSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

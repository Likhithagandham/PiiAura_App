import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { useFacultySalary } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { SalaryStatsBento } from '@/components/faculty/salary/SalaryStatsBento';
import { SalarySlipSection } from '@/components/faculty/salary/SalarySlipSection';
import { SalaryDocumentsSection } from '@/components/faculty/salary/SalaryDocumentsSection';
import { SalarySupportBanner } from '@/components/faculty/salary/SalarySupportBanner';
import { useToast } from '@/components/toast/ToastProvider';
import { WalkthroughTarget, useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function FacultySalaryScreen() {
  useModuleWalkthrough('salary');
  const { data, isLoading } = useFacultySalary();
  const toast = useToast();

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SALARY_STATS}>
          <SalaryStatsBento
            netPayableLabel={data.netPayableLabel}
            netPayableValue={data.netPayableValue}
            lastProcessedLabel={data.lastProcessedLabel}
            lastProcessedValue={data.lastProcessedValue}
          />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SALARY_SLIP}>
          <SalarySlipSection
            title={data.salarySlipTitle}
            historyLabel={data.historyLabel}
            monthLabel={data.monthLabel}
            months={data.months}
            defaultMonthId={data.defaultMonthId}
            payrollError={data.payrollError}
            onHistory={() => toast.show('Salary history coming soon', 'info')}
            onNotify={() => toast.show('Accounts team notified', 'success')}
          />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SALARY_DOCUMENTS}>
          <SalaryDocumentsSection
            title={data.documentsSectionTitle}
            documents={data.documents}
            onAction={(doc, action) =>
              toast.show(`${action === 'download' ? 'Downloading' : 'Sharing'} ${doc.title}`, 'info')
            }
          />
        </WalkthroughTarget>

        <SalarySupportBanner
          support={data.support}
          onAction={() => toast.show('Support ticket flow coming soon', 'info')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
});

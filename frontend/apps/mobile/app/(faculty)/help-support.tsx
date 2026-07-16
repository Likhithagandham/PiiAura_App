import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { FacultyHelpContact, FacultyHelpQuickLink } from '@piiaura/types';
import { getModuleWalkthroughOptions } from '@piiaura/constants';
import { useFacultyHelpSupport } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { HelpSupportIntro } from '@/components/faculty/help-support/HelpSupportIntro';
import { HelpFaqSection } from '@/components/faculty/help-support/HelpFaqSection';
import { HelpContactSection } from '@/components/faculty/help-support/HelpContactSection';
import {
  HelpQuickLinksSection,
  HelpSubmitTicketButton,
} from '@/components/faculty/help-support/HelpQuickLinksSection';
import { ProductTourSection } from '@/components/walkthrough/ProductTourSection';
import { useWalkthrough } from '@/components/walkthrough/WalkthroughProvider';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyHelpSupportScreen() {
  const { data, isLoading, isError, error, refetch } = useFacultyHelpSupport();
  const toast = useToast();
  const { replayDashboardTour } = useWalkthrough();
  const moduleOptions = getModuleWalkthroughOptions('faculty');

  const handleContactPress = (contact: FacultyHelpContact) => {
    toast.show(`Contacting ${contact.label}`, 'info');
  };

  const handleLinkPress = (link: FacultyHelpQuickLink) => {
    if (link.id === 'guide') {
      replayDashboardTour();
      return;
    }
    toast.show(`Opening ${link.label}`, 'info');
  };

  const handleSubmitTicket = () => {
    toast.show('Support ticket form coming soon', 'info');
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.errorTitle}>Could not load support data</Text>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'Backend did not return help-support data.'}
          </Text>
          <Text style={styles.retryLink} onPress={() => refetch()}>
            Retry
          </Text>
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
        <HelpSupportIntro title={data.title} description={data.description} />

        <ProductTourSection modules={moduleOptions} />

        <HelpFaqSection title={data.faqSectionTitle} faqs={data.faqs} />

        <HelpContactSection
          title={data.contactSectionTitle}
          contacts={data.contacts}
          onContactPress={handleContactPress}
        />

        <HelpQuickLinksSection
          title={data.quickLinksTitle}
          links={data.quickLinks}
          onLinkPress={handleLinkPress}
        />

        <HelpSubmitTicketButton
          label={data.submitTicketLabel}
          footnote={data.submitTicketFootnote}
          onPress={handleSubmitTicket}
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
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryLink: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
});

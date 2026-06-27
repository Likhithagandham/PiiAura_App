import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { FacultyHelpContact, FacultyHelpQuickLink } from '@piiaura/types';
import { useStudentHelpCenter } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { HelpSupportIntro } from '@/components/faculty/help-support/HelpSupportIntro';
import { HelpFaqSection } from '@/components/faculty/help-support/HelpFaqSection';
import { HelpContactSection } from '@/components/faculty/help-support/HelpContactSection';
import {
  HelpQuickLinksSection,
  HelpSubmitTicketButton,
} from '@/components/faculty/help-support/HelpQuickLinksSection';
import { useToast } from '@/components/toast/ToastProvider';

export default function StudentHelpScreen() {
  const { data, isLoading } = useStudentHelpCenter();
  const toast = useToast();

  const handleContactPress = (contact: FacultyHelpContact) => {
    toast.show(`Contacting ${contact.label}`, 'info');
  };

  const handleLinkPress = (link: FacultyHelpQuickLink) => {
    toast.show(`Opening ${link.label}`, 'info');
  };

  const handleSubmitTicket = () => {
    toast.show('Support ticket form coming soon', 'info');
  };

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading help center...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HelpSupportIntro title={data.title} description={data.description} />

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
    backgroundColor: '#F8F9FA',
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

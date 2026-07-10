import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useFacultyAiTools } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import {
  AiToolsSectionTabs,
  type AiToolsTabKey,
} from '@/components/faculty/ai-tools/AiToolsSectionTabs';
import { QuestionPaperForm } from '@/components/faculty/ai-tools/QuestionPaperForm';
import { RecentGenerationsGrid } from '@/components/faculty/ai-tools/RecentGenerationsGrid';
import { TopicQuizForm } from '@/components/faculty/ai-tools/TopicQuizForm';
import { RecentQuizList } from '@/components/faculty/ai-tools/RecentQuizList';
import { EngagementBanner } from '@/components/faculty/ai-tools/EngagementBanner';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyAiToolsScreen() {
  const { data, isLoading } = useFacultyAiTools();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<AiToolsTabKey>('question-paper');

  const handleGeneratePaper = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.show('Question paper generated successfully', 'success');
  };

  const handleGenerateQuiz = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.show('Topic quiz generated successfully', 'success');
  };

  const handleRecentPress = (title: string) => {
    toast.show(`Opening ${title}`, 'info');
  };

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const { topicQuiz } = data;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'question-paper' ? (
          <View style={styles.intro}>
            <View style={styles.poweredBy}>
              <Sparkles size={18} color={colors.primaryContainer} fill={colors.primaryContainer} />
              <Text style={styles.poweredByText}>{data.poweredByLabel}</Text>
            </View>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.description}>{data.description}</Text>
          </View>
        ) : (
          <View style={[styles.intro, styles.quizIntro]}>
            <Text style={styles.title}>{topicQuiz.title}</Text>
            <Text style={styles.description}>{topicQuiz.description}</Text>
          </View>
        )}

        <AiToolsSectionTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'question-paper' ? (
          <View style={styles.tabContent}>
            <QuestionPaperForm
              subjects={data.subjects}
              defaultSubject={data.defaultSubject}
              defaultDifficulty={data.defaultDifficulty}
              questionTypes={data.questionTypes}
              onGenerate={handleGeneratePaper}
            />
            <RecentGenerationsGrid
              items={data.recentGenerations}
              onItemPress={(item) => handleRecentPress(item.title)}
            />
          </View>
        ) : (
          <View style={styles.tabContent}>
            <TopicQuizForm
              subjects={topicQuiz.subjects}
              defaultSubject={topicQuiz.defaultSubject}
              defaultQuestionCount={topicQuiz.defaultQuestionCount}
              timerOptions={topicQuiz.timerOptions}
              defaultTimer={topicQuiz.defaultTimer}
              defaultDifficulty={topicQuiz.defaultDifficulty}
              onGenerate={handleGenerateQuiz}
            />
            <RecentQuizList
              items={topicQuiz.recentQuizzes}
              onItemPress={(item) => handleRecentPress(item.title)}
              onViewAll={() => toast.show('All quiz generations', 'info')}
            />
            <EngagementBanner banner={topicQuiz.engagementBanner} />
          </View>
        )}
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
    gap: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  intro: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quizIntro: {
    backgroundColor: 'rgba(0,52,43,0.05)',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: 0,
  },
  poweredBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  poweredByText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  tabContent: {
    gap: spacing['2xl'],
  },
});

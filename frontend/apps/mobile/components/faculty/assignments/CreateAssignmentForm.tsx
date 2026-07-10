import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ClipboardList, ChevronDown, Check, Paperclip } from 'lucide-react-native';
import { Button, colors, spacing, typography, radii } from '@piiaura/ui';

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/*',
] as const;

const MAX_FILE_BYTES = 25 * 1024 * 1024;

interface CreateAssignmentFormProps {
  classes: string[];
  subjects: string[];
  onPublish: (payload: {
    title: string;
    className: string;
    subject: string;
    description: string;
  }) => Promise<void>;
  onAttach?: (file: { name: string; uri: string }) => void;
  onAttachError?: (message: string) => void;
}

type PickerField = 'class' | 'subject' | null;

function FieldLabel({
  children,
  nativeId,
}: {
  children: string;
  nativeId: string;
}) {
  return (
    <Text nativeID={nativeId} style={styles.label} accessibilityRole="text">
      {children}
    </Text>
  );
}

export function CreateAssignmentForm({
  classes,
  subjects,
  onPublish,
  onAttach,
  onAttachError,
}: CreateAssignmentFormProps) {
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState(classes[0] ?? '');
  const [subject, setSubject] = useState(subjects[0] ?? '');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [pickerField, setPickerField] = useState<PickerField>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [pickingAttachment, setPickingAttachment] = useState(false);

  const pickerOptions = pickerField === 'class' ? classes : subjects;
  const pickerValue = pickerField === 'class' ? className : subject;
  const pickerTitle = pickerField === 'class' ? 'Class' : 'Subject';

  const handlePublish = async () => {
    if (!title.trim()) return;
    setPublishing(true);
    try {
      await onPublish({ title, className, subject, description });
      setPublished(true);
      setTitle('');
      setDescription('');
      setAttachmentName(null);
      setTimeout(() => setPublished(false), 2000);
    } finally {
      setPublishing(false);
    }
  };

  const handlePickerSelect = (value: string) => {
    if (pickerField === 'class') setClassName(value);
    else setSubject(value);
    setPickerField(null);
  };

  const handleAttach = async () => {
    if (pickingAttachment || publishing) return;

    setPickingAttachment(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...ACCEPTED_MIME_TYPES],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.name || !asset.uri) {
        onAttachError?.('Could not read the selected file. Please try again.');
        return;
      }

      if (asset.size && asset.size > MAX_FILE_BYTES) {
        onAttachError?.('Attachment must be 25MB or smaller.');
        return;
      }

      setAttachmentName(asset.name);
      onAttach?.({ name: asset.name, uri: asset.uri });
    } catch {
      onAttachError?.('Unable to open the file picker. Please try again.');
    } finally {
      setPickingAttachment(false);
    }
  };

  const publishLabel = published ? 'Success!' : 'Publish Assignment';

  return (
    <View style={styles.card} accessibilityLabel="Create assignment form">
      <View style={styles.cardHeader} accessibilityRole="header">
        <View accessibilityElementsHidden importantForAccessibility="no">
          <ClipboardList size={20} color={colors.primary} />
        </View>
        <Text style={styles.cardTitle}>Create Assignment</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <FieldLabel nativeId="assignment-title-label">Title</FieldLabel>
          <TextInput
            style={styles.input}
            placeholder="e.g. Quadratic Equations Quiz"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            accessibilityLabel="Assignment title"
            accessibilityLabelledBy="assignment-title-label"
            accessibilityHint="Enter the assignment title"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <FieldLabel nativeId="assignment-class-label">Class</FieldLabel>
            <Pressable
              style={styles.select}
              onPress={() => setPickerField('class')}
              accessibilityRole="button"
              accessibilityLabel={`Class, ${className}`}
              accessibilityHint="Opens class picker"
              accessibilityState={{ expanded: pickerField === 'class' }}
            >
              <Text style={styles.selectText}>{className}</Text>
              <View accessibilityElementsHidden importantForAccessibility="no">
                <ChevronDown size={18} color={colors.textSecondary} />
              </View>
            </Pressable>
          </View>
          <View style={[styles.field, styles.halfField]}>
            <FieldLabel nativeId="assignment-subject-label">Subject</FieldLabel>
            <Pressable
              style={styles.select}
              onPress={() => setPickerField('subject')}
              accessibilityRole="button"
              accessibilityLabel={`Subject, ${subject}`}
              accessibilityHint="Opens subject picker"
              accessibilityState={{ expanded: pickerField === 'subject' }}
            >
              <Text style={styles.selectText}>{subject}</Text>
              <View accessibilityElementsHidden importantForAccessibility="no">
                <ChevronDown size={18} color={colors.textSecondary} />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel nativeId="assignment-description-label">Description</FieldLabel>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Provide instructions for the students..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            accessibilityLabel="Assignment description"
            accessibilityLabelledBy="assignment-description-label"
            accessibilityHint="Provide instructions for the students"
          />
        </View>

        <View style={styles.actions}>
          <Button
            label={publishLabel}
            onPress={handlePublish}
            loading={publishing}
            disabled={publishing || published || !title.trim()}
            style={[styles.publishBtn, published && styles.successBtn]}
            accessibilityHint={
              !title.trim()
                ? 'Enter a title before publishing'
                : 'Publishes this assignment to students'
            }
          />
          <Pressable
            style={styles.attachBtn}
            onPress={handleAttach}
            disabled={pickingAttachment || publishing}
            accessibilityRole="button"
            accessibilityLabel="Attach file"
            accessibilityHint={
              attachmentName
                ? `Currently attached: ${attachmentName}. Tap to choose a different file`
                : 'Opens file picker for PDF, document, or image attachments'
            }
            accessibilityState={{ busy: pickingAttachment, disabled: pickingAttachment || publishing }}
          >
            {pickingAttachment ? (
              <ActivityIndicator color="#576867" />
            ) : (
              <View accessibilityElementsHidden importantForAccessibility="no">
                <Paperclip size={20} color="#576867" />
              </View>
            )}
          </Pressable>
        </View>
        {attachmentName ? (
          <Text
            style={styles.attachmentName}
            accessibilityRole="text"
            accessibilityLabel={`Attached file: ${attachmentName}`}
          >
            Attached: {attachmentName}
          </Text>
        ) : null}
      </View>

      <Modal
        visible={pickerField !== null}
        transparent
        animationType="fade"
        accessibilityViewIsModal
        onRequestClose={() => setPickerField(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPickerField(null)}
          accessibilityRole="button"
          accessibilityLabel="Close picker"
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(event) => event.stopPropagation()}
            accessibilityRole="menu"
            accessibilityLabel={`${pickerTitle} picker`}
          >
            <Text style={styles.modalTitle} accessibilityRole="header">
              {pickerTitle}
            </Text>
            <ScrollView>
              {pickerOptions.map((option) => {
                const selected = pickerValue === option;
                return (
                  <Pressable
                    key={option}
                    style={styles.modalOption}
                    onPress={() => handlePickerSelect(option)}
                    accessibilityRole="menuitem"
                    accessibilityLabel={option}
                    accessibilityState={{ selected }}
                  >
                    <Text style={styles.modalOptionText}>{option}</Text>
                    {selected ? (
                      <View accessibilityElementsHidden importantForAccessibility="no">
                        <Check size={18} color={colors.primary} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  form: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    minHeight: 44,
  },
  textarea: {
    minHeight: 88,
    paddingTop: spacing.md,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  selectText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  publishBtn: {
    flex: 1,
  },
  successBtn: {
    backgroundColor: '#15803D',
  },
  attachBtn: {
    backgroundColor: colors.secondaryContainer,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  attachmentName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '40%',
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
});

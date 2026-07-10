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
import { Upload, CloudUpload, ChevronDown, Check } from 'lucide-react-native';
import { Button, colors, spacing, typography, radii } from '@piiaura/ui';

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const;

const MAX_FILE_BYTES = 25 * 1024 * 1024;

interface SelectedFile {
  name: string;
  uri: string;
  size?: number;
}

interface StudyMaterialUploadFormProps {
  sessions: string[];
  defaultSession: string;
  onUpload: (payload: {
    session: string;
    date: string;
    fileName: string;
    fileUri: string;
  }) => Promise<void>;
  onPickError?: (message: string) => void;
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function StudyMaterialUploadForm({
  sessions,
  defaultSession,
  onUpload,
  onPickError,
}: StudyMaterialUploadFormProps) {
  const [session, setSession] = useState(defaultSession);
  const [date, setDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [picking, setPicking] = useState(false);

  const handleSelectFile = async () => {
    if (picking || uploading) return;

    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...ACCEPTED_MIME_TYPES],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.name || !asset.uri) {
        onPickError?.('Could not read the selected file. Please try again.');
        return;
      }

      if (asset.size && asset.size > MAX_FILE_BYTES) {
        onPickError?.('File must be 25MB or smaller.');
        return;
      }

      setSelectedFile({
        name: asset.name,
        uri: asset.uri,
        size: asset.size,
      });
    } catch {
      onPickError?.('Unable to open the file picker. Please try again.');
    } finally {
      setPicking(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload({
        session,
        date,
        fileName: selectedFile.name,
        fileUri: selectedFile.uri,
      });
      setSelectedFile(null);
      setDate('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Upload size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>Upload Class Notes</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <FieldLabel>Session</FieldLabel>
            <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
              <Text style={styles.selectText}>{session}</Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={[styles.field, styles.halfField]}>
            <FieldLabel>Date</FieldLabel>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={date}
              onChangeText={setDate}
            />
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel>Select File</FieldLabel>
          <Pressable
            style={[styles.dropzone, selectedFile ? styles.dropzoneSelected : undefined]}
            onPress={handleSelectFile}
            disabled={picking || uploading}
          >
            {picking ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <CloudUpload
                size={40}
                color={selectedFile ? colors.primary : colors.textSecondary}
              />
            )}
            <Text
              numberOfLines={2}
              style={[styles.dropzoneText, selectedFile && styles.dropzoneTextSelected]}
            >
              {picking
                ? 'Opening file picker...'
                : selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : 'Tap to select PDF or Doc'}
            </Text>
            {selectedFile ? (
              <Text style={styles.changeFileHint}>Tap again to choose a different file</Text>
            ) : null}
          </Pressable>
        </View>

        <Button
          label="Upload Material"
          onPress={handleUpload}
          loading={uploading}
          disabled={!selectedFile || uploading || picking}
          fullWidth
        />
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Session</Text>
            <ScrollView>
              {sessions.map((item) => (
                <Pressable
                  key={item}
                  style={styles.modalOption}
                  onPress={() => {
                    setSession(item);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                  {session === item ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
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
    padding: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  form: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
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
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dropzoneSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(175,239,221,0.2)',
  },
  dropzoneText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  dropzoneTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  changeFileHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
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

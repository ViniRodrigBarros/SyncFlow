import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  LANGUAGE_OPTIONS,
  type LanguageCode,
} from '../../../../core/shared/services';

interface LanguagePickerSheetProps {
  visible: boolean;
  selected: LanguageCode;
  onClose: () => void;
  onSelect: (code: LanguageCode) => void;
}

export const LanguagePickerSheet = ({
  visible,
  selected,
  onClose,
  onSelect,
}: LanguagePickerSheetProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.handle} />
        <Text style={styles.title}>Selecione o idioma</Text>
        {LANGUAGE_OPTIONS.map(opt => {
          const isSelected = opt.code === selected;
          return (
            <Pressable
              key={opt.code}
              onPress={() => {
                onSelect(opt.code);
                onClose();
              }}
              style={({ pressed }) => [
                styles.row,
                isSelected && styles.rowSelected,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.rowLabel, isSelected && styles.rowLabelSelected]}>
                {opt.label}
              </Text>
              {isSelected ? (
                <MaterialIcons name="check" size={20} color="#712AE2" />
              ) : null}
            </Pressable>
          );
        })}
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 4,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rowSelected: {
    backgroundColor: 'rgba(113, 42, 226, 0.08)',
  },
  rowLabel: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  rowLabelSelected: {
    color: '#5B21B6',
    fontWeight: '700',
  },
});

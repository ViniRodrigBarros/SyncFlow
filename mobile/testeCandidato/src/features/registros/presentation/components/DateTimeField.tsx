import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface DateTimeFieldProps {
  value: number;
  onChange: (newValue: number) => void;
}

const COLORS = {
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#76777D',
};

const PT_MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const formatDate = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getDate()} ${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const formatTime = (ms: number): string => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
};

/**
 * Dois pills lado a lado: data e hora. Cada um abre o picker nativo
 * (modal no Android, inline no iOS via display='spinner').
 *
 * O componente nunca persiste estado — só notifica via `onChange(ms)`.
 */
export const DateTimeField = ({ value, onChange }: DateTimeFieldProps) => {
  const [openMode, setOpenMode] = useState<'date' | 'time' | null>(null);

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    // No Android, dismiss tem `type === 'dismissed'`; só fechamos sem mudar.
    if (Platform.OS === 'android') setOpenMode(null);
    if (event.type === 'dismissed' || !selected) return;
    const current = new Date(value);
    if (openMode === 'date') {
      current.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    } else if (openMode === 'time') {
      current.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    onChange(current.getTime());
  };

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          onPress={() => setOpenMode('date')}
          accessibilityRole="button"
        >
          <MaterialIcons name="event" size={18} color={COLORS.textSecondary} />
          <Text style={styles.chipText}>{formatDate(value)}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.chip,
            styles.chipTime,
            pressed && styles.chipPressed,
          ]}
          onPress={() => setOpenMode('time')}
          accessibilityRole="button"
        >
          <MaterialIcons
            name="schedule"
            size={18}
            color={COLORS.textSecondary}
          />
          <Text style={styles.chipText}>{formatTime(value)}</Text>
        </Pressable>
      </View>

      {openMode ? (
        <DateTimePicker
          value={new Date(value)}
          mode={openMode}
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handlePickerChange}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipTime: { flex: 0, minWidth: 110 },
  chipPressed: { backgroundColor: '#F2F4F6' },
  chipText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
});

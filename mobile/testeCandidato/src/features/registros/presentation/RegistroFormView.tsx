import { MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Card,
  HeaderBar,
  PrimaryButton,
  SecondaryButton,
} from '../../../core/shared/components';
import { useRegistroFormViewModel } from '../hooks/useRegistroFormViewModel';
import { DateTimeField, FotoPicker, TipoPicker } from './components';

const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#45464D',
  textMuted: '#76777D',
  danger: '#BA1A1A',
};

const MIN_DESCRICAO = 10;

export const RegistroFormView = () => {
  const vm = useRegistroFormViewModel();

  const handleDelete = () => {
    Alert.alert(
      'Excluir registro',
      'Esta ação remove o registro definitivamente. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void vm.onDelete();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HeaderBar
        title={vm.title}
        onBack={vm.onCancel}
        backLabel="Cancelar"
      />

      {vm.loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#712AE2" />
        </View>
      ) : vm.loadError ? (
        <View style={styles.center}>
          <Text style={styles.errorMessage}>{vm.loadError}</Text>
          <View style={{ height: 16 }} />
          <SecondaryButton label="Voltar" onPress={vm.onCancel} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Categoria + Data/Hora (2 cards lado a lado em tablets) */}
            <View style={styles.row}>
              <Card style={styles.cardFlex}>
                <Text style={styles.label}>Categoria</Text>
                <View style={{ height: 8 }} />
                <TipoPicker value={vm.state.tipo} onChange={vm.setTipo} />
              </Card>
            </View>

            <View style={{ height: 12 }} />

            <Card>
              <Text style={styles.label}>Data e Hora</Text>
              <View style={{ height: 8 }} />
              <DateTimeField
                value={vm.state.dataHora}
                onChange={vm.setDataHora}
              />
            </Card>

            <View style={{ height: 12 }} />

            {/* Descrição */}
            <Card>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Descrição</Text>
                <Text style={styles.counter}>
                  {vm.state.descricao.length}/{MIN_DESCRICAO}+
                </Text>
              </View>
              <View style={{ height: 8 }} />
              <TextInput
                value={vm.state.descricao}
                onChangeText={vm.setDescricao}
                placeholder="Descreva o lançamento: o que aconteceu, valores, observações…"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                textAlignVertical="top"
              />
              <Text style={styles.hint}>
                Mínimo de {MIN_DESCRICAO} caracteres.
              </Text>
            </Card>

            <View style={{ height: 12 }} />

            {/* Fotos */}
            <Card>
              <View style={styles.labelRow}>
                <View style={styles.iconLabel}>
                  <MaterialIcons
                    name="photo-camera"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                  <Text style={[styles.label, { marginLeft: 6 }]}>
                    Fotos anexadas
                  </Text>
                </View>
                <Text style={styles.helperRight}>
                  {vm.pickerFotos.length} foto
                  {vm.pickerFotos.length === 1 ? '' : 's'}
                </Text>
              </View>
              <View style={{ height: 12 }} />
              <FotoPicker
                fotos={vm.pickerFotos}
                onAdd={vm.addFotos}
                onRemove={vm.removeFoto}
              />
            </Card>

            {vm.formError ? (
              <View style={styles.errorBox}>
                <MaterialIcons
                  name="error-outline"
                  size={16}
                  color={COLORS.danger}
                />
                <Text style={styles.errorBoxText}>{vm.formError}</Text>
              </View>
            ) : null}

            <View style={{ height: 24 }} />

            {/* Actions */}
            <View style={styles.actions}>
              <SecondaryButton
                label="Cancelar"
                onPress={vm.onCancel}
                style={styles.actionBtn}
              />
              <PrimaryButton
                label={vm.isEditMode ? 'Salvar alterações' : 'Salvar'}
                onPress={vm.onSubmit}
                loading={vm.saving}
                style={styles.actionBtn}
              />
            </View>

            {vm.isEditMode ? (
              <Pressable
                onPress={handleDelete}
                disabled={vm.removing}
                style={({ pressed }) => [
                  styles.deleteRow,
                  pressed && { opacity: 0.6 },
                ]}
              >
                {vm.removing ? (
                  <ActivityIndicator color={COLORS.danger} />
                ) : (
                  <>
                    <MaterialIcons
                      name="delete-outline"
                      size={18}
                      color={COLORS.danger}
                    />
                    <Text style={styles.deleteText}>Excluir registro</Text>
                  </>
                )}
              </Pressable>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorMessage: {
    color: COLORS.danger,
    textAlign: 'center',
    fontWeight: '500',
  },
  row: { flexDirection: 'row', gap: 12 },
  cardFlex: { flex: 1 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconLabel: { flexDirection: 'row', alignItems: 'center' },
  counter: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  helperRight: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 96,
  },
  hint: {
    marginTop: 6,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  errorBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(186, 26, 26, 0.06)',
    borderColor: 'rgba(186, 26, 26, 0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBoxText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionBtn: { flex: 1 },
  deleteRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Card,
  HeaderBar,
  PrimaryButton,
  SecondaryButton,
} from '../../../core/shared/components';
import { useRegistroDetailViewModel } from '../hooks/useRegistroDetailViewModel';
import { FotoGrid } from './components';

const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#45464D',
  textMuted: '#76777D',
  success: '#009668',
  warning: '#93000A',
  danger: '#BA1A1A',
};

const PT_MONTHS_FULL = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const formatDateLong = (ms: number): string => {
  if (!ms) return '—';
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${PT_MONTHS_FULL[d.getMonth()]} ${d.getFullYear()} • ${hh}:${mm}`;
};

const formatRelative = (ms: number): string => {
  if (!ms) return '—';
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} d`;
  return formatDateLong(ms);
};

export const RegistroDetailView = () => {
  const vm = useRegistroDetailViewModel();

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
            void vm.onDeleteConfirmed();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HeaderBar
        title="Detalhes"
        onBack={vm.onBack}
        rightSlot={
          vm.registro ? (
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: vm.registro.isPending
                    ? 'rgba(255, 218, 214, 0.5)'
                    : 'rgba(111, 251, 190, 0.18)',
                  borderColor: vm.registro.isPending
                    ? 'rgba(186, 26, 26, 0.2)'
                    : 'rgba(0, 150, 104, 0.25)',
                },
              ]}
            >
              <MaterialIcons
                name={vm.registro.isPending ? 'schedule' : 'cloud-done'}
                size={14}
                color={vm.registro.isPending ? COLORS.warning : COLORS.success}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: vm.registro.isPending
                      ? COLORS.warning
                      : COLORS.success,
                  },
                ]}
              >
                {vm.registro.isPending ? 'Pendente' : 'Sincronizado'}
              </Text>
            </View>
          ) : undefined
        }
      />

      {vm.loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#712AE2" />
        </View>
      ) : vm.loadError || !vm.registro ? (
        <View style={styles.center}>
          <Text style={styles.errorMessage}>
            {vm.loadError ?? 'Registro indisponível.'}
          </Text>
          <View style={{ height: 16 }} />
          <SecondaryButton label="Voltar" onPress={vm.onBack} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero block: tipo + data */}
          <View style={styles.hero}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    vm.registro.tipo === 'COMPRA'
                      ? 'rgba(113, 42, 226, 0.10)'
                      : 'rgba(78, 222, 163, 0.18)',
                },
              ]}
            >
              <MaterialIcons
                name={
                  vm.registro.tipo === 'COMPRA' ? 'shopping-bag' : 'receipt-long'
                }
                size={14}
                color={vm.registro.tipo === 'COMPRA' ? '#5B21B6' : '#005236'}
              />
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color:
                      vm.registro.tipo === 'COMPRA' ? '#5B21B6' : '#005236',
                  },
                ]}
              >
                {vm.registro.tipo === 'COMPRA' ? 'Compra' : 'Venda'}
              </Text>
            </View>
            <View style={{ height: 8 }} />
            <Text style={styles.heroTitle} numberOfLines={3}>
              {vm.registro.descricao || 'Registro sem descrição'}
            </Text>
            <View style={styles.heroMeta}>
              <MaterialIcons
                name="schedule"
                size={14}
                color={COLORS.textMuted}
              />
              <Text style={styles.heroMetaText}>
                {formatDateLong(vm.registro.dataHora)}
              </Text>
            </View>
          </View>

          {/* Bento: descrição */}
          <Card>
            <View style={styles.cardHead}>
              <MaterialIcons
                name="description"
                size={18}
                color="#712AE2"
              />
              <Text style={styles.cardHeadTitle}>Descrição completa</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.descricao}>{vm.registro.descricao}</Text>
          </Card>

          <View style={{ height: 12 }} />

          {/* Bento: galeria */}
          <Card>
            <View style={styles.cardHead}>
              <MaterialIcons
                name="photo-library"
                size={18}
                color="#712AE2"
              />
              <Text style={styles.cardHeadTitle}>
                Fotos ({vm.registro.fotos.length})
              </Text>
            </View>
            <View style={styles.divider} />
            <FotoGrid fotos={vm.registro.fotos} />
          </Card>

          <View style={{ height: 12 }} />

          {/* Bento: metadados */}
          <Card>
            <View style={styles.cardHead}>
              <MaterialIcons name="badge" size={18} color={COLORS.textMuted} />
              <Text
                style={[styles.cardHeadTitle, { color: COLORS.textSecondary }]}
              >
                Metadados
              </Text>
            </View>
            <View style={styles.divider} />
            <MetadataRow label="Criado" value={formatRelative(vm.registro.createdAt)} />
            <MetadataRow label="Atualizado" value={formatRelative(vm.registro.updatedAt)} />
            <MetadataRow label="Empresa" value={`#${vm.registro.empresaId}`} />
            <MetadataRow
              label="ID local"
              mono
              value={vm.registro.id}
            />
            <MetadataRow
              label="Status de sync"
              value={vm.registro.isPending ? 'Pendente' : 'Sincronizado'}
            />
          </Card>

          <View style={{ height: 28 }} />

          {/* Ações */}
          <View style={styles.actions}>
            <SecondaryButton
              label="Editar"
              onPress={vm.onEdit}
              style={styles.actionBtn}
            />
            <PrimaryButton
              label="Excluir"
              onPress={handleDelete}
              loading={vm.removing}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const MetadataRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <View style={metaStyles.row}>
    <Text style={metaStyles.label}>{label}</Text>
    <Text
      style={[metaStyles.value, mono && metaStyles.valueMono]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
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
  hero: { marginBottom: 16 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  heroMetaText: { color: COLORS.textMuted, fontSize: 13 },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  descricao: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
});

const metaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
    gap: 12,
  },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  value: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  valueMono: { fontFamily: 'Geist' },
});

import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F4F6',
  surfaceVariant: '#E0E3E5',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#45464D',
  outline: '#76777D',
  brand: '#712AE2',
  brandHover: '#5B21B6',
  danger: '#BA1A1A',
};

interface OfflineStateProps {
  pendingCount: number;
  onRetry: () => void;
  onViewLocal: () => void;
  isRetrying?: boolean;
}

/**
 * Estado "Sem conexão" mostrado pela Home quando o app está offline e o
 * usuário ainda não pediu para ver os registros locais (botão "Ver Registros
 * Locais"). Reproduz o layout do Stitch — ilustração com cloud_off + lista
 * fantasma + badge "Aguardando Conexão" + CTAs + fila de sincronização.
 */
export const OfflineState = ({
  pendingCount,
  onRetry,
  onViewLocal,
  isRetrying,
}: OfflineStateProps) => {
  const pendingLabel = pendingCount === 1 ? '1 item' : `${pendingCount} itens`;
  const hasPending = pendingCount > 0;

  return (
    <View style={styles.root}>
      <View style={styles.illustration}>
        <View style={styles.illustrationInner}>
          <View style={styles.dashedRing}>
            <View style={styles.cloudCircle}>
              <MaterialIcons name="cloud-off" size={40} color={COLORS.outline} />
            </View>
          </View>
          <View style={styles.mockRows}>
            <View style={styles.mockRow}>
              <View style={styles.mockChip} />
              <View style={[styles.mockBar, { width: '38%' }]} />
              <View style={[styles.mockBar, { width: '22%', marginLeft: 'auto' }]} />
            </View>
            <View style={[styles.mockRow, { width: '86%' }]}>
              <View style={styles.mockChip} />
              <View style={[styles.mockBar, { width: '42%' }]} />
            </View>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>AGUARDANDO CONEXÃO</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>Sem conexão</Text>
      <Text style={styles.body}>
        Não conseguimos acessar o servidor no momento. Você pode continuar
        visualizando seus registros locais. As alterações serão sincronizadas
        assim que a internet voltar.
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={isRetrying ? undefined : onRetry}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              opacity: isRetrying ? 0.6 : pressed ? 0.85 : 1,
              transform: [{ scale: pressed && !isRetrying ? 0.98 : 1 }],
            },
          ]}
          accessibilityRole="button"
          accessibilityState={{ busy: isRetrying }}
        >
          <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>
            {isRetrying ? 'Tentando…' : 'Tentar Novamente'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onViewLocal}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: pressed ? '#F2F4F6' : COLORS.surface,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          accessibilityRole="button"
        >
          <MaterialIcons name="folder-open" size={18} color={COLORS.textPrimary} />
          <Text style={styles.secondaryButtonText}>Ver Registros Locais</Text>
        </Pressable>
      </View>

      <View style={styles.queueDivider} />

      <View style={styles.queueHeader}>
        <Text style={styles.queueTitle}>Fila de Sincronização</Text>
        <View style={styles.queueCount}>
          <Text style={styles.queueCountText}>{pendingLabel}</Text>
        </View>
      </View>

      <View
        style={[
          styles.queueEmpty,
          hasPending ? styles.queuePending : styles.queueEmptyDefault,
        ]}
      >
        <MaterialIcons
          name={hasPending ? 'schedule' : 'inbox'}
          size={28}
          color={hasPending ? COLORS.brand : COLORS.outline}
        />
        <Text style={styles.queueEmptyTitle}>
          {hasPending
            ? `Aguardando envio: ${pendingLabel}`
            : 'Nenhum dado aguardando sincronização.'}
        </Text>
        <Text style={styles.queueEmptySubtitle}>
          {hasPending
            ? 'Enviaremos automaticamente quando a internet voltar.'
            : 'Tudo está em dia com a última conexão.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  illustration: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 4 / 3,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  illustrationInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  dashedRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E6E8EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockRows: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    opacity: 0.6,
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECEEF0',
    borderRadius: 8,
    width: '100%',
    height: 36,
    paddingHorizontal: 10,
    gap: 8,
  },
  mockChip: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceVariant,
  },
  mockBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceVariant,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  statusBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 6,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.brand,
    borderRadius: 10,
    paddingVertical: 14,
    shadowColor: COLORS.brand,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  queueDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 28,
    marginBottom: 20,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  queueCount: {
    backgroundColor: '#E6E8EA',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  queueCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  queueEmpty: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  queueEmptyDefault: {
    backgroundColor: '#F2F4F6',
  },
  queuePending: {
    backgroundColor: 'rgba(113, 42, 226, 0.05)',
    borderColor: 'rgba(113, 42, 226, 0.25)',
  },
  queueEmptyTitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  queueEmptySubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.outline,
    textAlign: 'center',
  },
});

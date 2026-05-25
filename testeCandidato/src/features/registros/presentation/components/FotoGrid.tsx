import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

import { env } from '../../../../core/config/env';

interface FotoGridItem {
  id: string;
  caminho: string;
  localUri: string | null;
  isLocalOnly: boolean;
}

interface FotoGridProps {
  fotos: FotoGridItem[];
}

const COLORS = {
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textSecondary: '#76777D',
};

/**
 * Resolve a URI exibível: prefere a local (rápido, funciona offline),
 * cai para a URL do servidor (prefixada com `apiBaseUrl`) se não houver.
 */
const resolveUri = (foto: FotoGridItem): string => {
  if (foto.localUri) return foto.localUri;
  if (foto.caminho.startsWith('http')) return foto.caminho;
  if (foto.caminho.startsWith('/')) {
    return `${env.apiBaseUrl}${foto.caminho}`;
  }
  return foto.caminho;
};

/**
 * Galeria read-only com lightbox simples (toque abre fullscreen).
 * Usado pela tela de Detalhes do registro.
 */
export const FotoGrid = ({ fotos }: FotoGridProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (fotos.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialIcons name="image" size={28} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>Nenhuma foto anexada</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.grid}>
        {fotos.map((foto, idx) => (
          <Pressable
            key={foto.id}
            onPress={() => setOpenIndex(idx)}
            style={({ pressed }) => [
              styles.cell,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Image source={{ uri: resolveUri(foto) }} style={styles.thumb} />
            {foto.isLocalOnly ? (
              <View style={styles.pendingPill}>
                <MaterialIcons name="schedule" size={10} color="#93000A" />
                <Text style={styles.pendingText}>Pendente</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={openIndex !== null}
        onRequestClose={() => setOpenIndex(null)}
      >
        {openIndex !== null && fotos[openIndex] ? (
          <Pressable style={styles.lightbox} onPress={() => setOpenIndex(null)}>
            <Image
              source={{ uri: resolveUri(fotos[openIndex]) }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
            <Pressable
              onPress={() => setOpenIndex(null)}
              hitSlop={10}
              style={styles.lightboxClose}
            >
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </Pressable>
        ) : null}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  thumb: { width: '100%', height: '100%' },
  pendingPill: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 218, 214, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pendingText: {
    color: '#93000A',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: { width: '100%', height: '85%' },
  lightboxClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

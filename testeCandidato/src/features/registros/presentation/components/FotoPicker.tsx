import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { NewFotoInput } from '../../../../core/shared/repositories';

interface FotoPickerProps {
  /** Fotos já anexadas em sessão atual + persistidas. */
  fotos: PickerFotoItem[];
  onAdd: (novas: NewFotoInput[]) => void;
  onRemove: (id: string) => void;
}

export interface PickerFotoItem {
  id: string;
  /** URI exibível (file:// local ou http(s):// remoto). */
  uri: string;
  /** Se `true`, ainda não foi enviada ao servidor. */
  isLocalOnly: boolean;
}

const COLORS = {
  surface: '#FFFFFF',
  surfaceLow: '#F2F4F6',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#76777D',
  brand: '#712AE2',
  danger: '#BA1A1A',
};

/**
 * Grid de fotos + botão "Adicionar". O `+` abre um modal com 2 ações:
 *  - "Tirar foto" → câmera (expo-image-picker `launchCameraAsync`)
 *  - "Escolher da galeria" → media library (`launchImageLibraryAsync`)
 *
 * Permissões: pedimos sob demanda via `requestCameraPermissionsAsync` e
 * `requestMediaLibraryPermissionsAsync`. Negação derruba apenas a ação
 * pedida — o resto da tela continua usável.
 */
export const FotoPicker = ({ fotos, onAdd, onRemove }: FotoPickerProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleAddFromGallery = async () => {
    setSheetOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Permita acesso à galeria nas configurações do dispositivo.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 8,
      quality: 0.8,
    });
    if (result.canceled || !result.assets) return;
    const inputs: NewFotoInput[] = result.assets.map(a => ({
      localUri: a.uri,
      mimeType: a.mimeType ?? undefined,
      fileName: a.fileName ?? undefined,
    }));
    onAdd(inputs);
  };

  const handleAddFromCamera = async () => {
    setSheetOpen(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Permita acesso à câmera nas configurações do dispositivo.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    onAdd([
      {
        localUri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
        fileName: asset.fileName ?? undefined,
      },
    ]);
  };

  return (
    <View>
      <View style={styles.grid}>
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [
            styles.addCell,
            pressed && { backgroundColor: 'rgba(113, 42, 226, 0.08)' },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Adicionar foto"
        >
          <MaterialIcons
            name="add-photo-alternate"
            size={26}
            color={COLORS.brand}
          />
          <Text style={styles.addLabel}>Adicionar</Text>
        </Pressable>

        {fotos.map(foto => (
          <View key={foto.id} style={styles.thumbCell}>
            <Image source={{ uri: foto.uri }} style={styles.thumb} />
            {foto.isLocalOnly ? (
              <View style={styles.pendingPill}>
                <MaterialIcons name="schedule" size={10} color="#93000A" />
                <Text style={styles.pendingPillText}>Pendente</Text>
              </View>
            ) : null}
            <Pressable
              onPress={() => onRemove(foto.id)}
              hitSlop={6}
              style={({ pressed }) => [
                styles.removeBtn,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Remover foto"
            >
              <MaterialIcons name="close" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={sheetOpen}
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setSheetOpen(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Adicionar foto</Text>

            <Pressable
              onPress={handleAddFromCamera}
              style={({ pressed }) => [
                styles.sheetItem,
                pressed && { backgroundColor: COLORS.surfaceLow },
              ]}
            >
              <MaterialIcons
                name="photo-camera"
                size={22}
                color={COLORS.textPrimary}
              />
              <Text style={styles.sheetItemText}>Tirar foto</Text>
            </Pressable>

            <Pressable
              onPress={handleAddFromGallery}
              style={({ pressed }) => [
                styles.sheetItem,
                pressed && { backgroundColor: COLORS.surfaceLow },
              ]}
            >
              <MaterialIcons
                name="photo-library"
                size={22}
                color={COLORS.textPrimary}
              />
              <Text style={styles.sheetItemText}>Escolher da galeria</Text>
            </Pressable>

            <Pressable
              onPress={() => setSheetOpen(false)}
              style={({ pressed }) => [
                styles.sheetCancel,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addCell: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.brand,
  },
  thumbCell: {
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
  pendingPillText: {
    color: '#93000A',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
  },
  sheetItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  sheetCancel: {
    marginTop: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

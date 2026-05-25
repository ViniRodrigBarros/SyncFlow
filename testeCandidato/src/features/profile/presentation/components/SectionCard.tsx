import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface SectionCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SectionCard = ({ children, style }: SectionCardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});

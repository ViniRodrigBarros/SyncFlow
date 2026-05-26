import { View } from 'react-native';

export interface GapProps {
  width?: number;
  height?: number;
}

export const Gap = ({ width, height }: GapProps) => (
  <View style={{ width, height }} />
);

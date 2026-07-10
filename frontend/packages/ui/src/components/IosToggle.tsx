import { Pressable, View, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

export interface IosToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function IosToggle({ value, onChange, disabled }: IosToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      onPress={() => onChange(!value)}
      disabled={disabled}
      style={[styles.track, value && styles.trackOn, disabled && styles.disabled]}
    >
      <View style={[styles.dot, value && styles.dotOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.borderLight,
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.primaryContainer,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    transform: [{ translateX: 0 }],
  },
  dotOn: {
    transform: [{ translateX: 20 }],
  },
  disabled: {
    opacity: 0.6,
  },
});


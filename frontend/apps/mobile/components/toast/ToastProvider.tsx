import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radii } from '@piiaura/ui';

type ToastVariant = 'success' | 'danger' | 'info';

interface ToastState {
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -8, duration: 140, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      if (hideTimer.current) clearTimeout(hideTimer.current);

      setToast({ message, variant });
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();

      hideTimer.current = setTimeout(hide, 1200);
    },
    [hide, opacity, translateY],
  );

  const value = useMemo<ToastContextValue>(() => ({ show }), [show]);

  const bg =
    toast?.variant === 'success'
      ? colors.primaryContainer
      : toast?.variant === 'danger'
        ? colors.error
        : colors.surfaceContainerHigh;
  const fg =
    toast?.variant === 'success' || toast?.variant === 'danger' ? colors.white : colors.text;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={[styles.overlay, { top: insets.top + spacing.md }]}>
          <Animated.View
            style={[
              styles.toast,
              { backgroundColor: bg },
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Text style={[styles.text, { color: fg }]} numberOfLines={2}>
              {toast.message}
            </Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    right: spacing.lg,
    left: spacing.lg,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  toast: {
    maxWidth: 260,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});


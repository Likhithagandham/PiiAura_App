import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import type { WalkthroughPlacement, WalkthroughStepConfig } from '@piiaura/types';
import { colors, spacing, typography, radii } from '../theme';

export interface WalkthroughOverlayProps {
  visible: boolean;
  step: WalkthroughStepConfig;
  stepIndex: number;
  totalSteps: number;
  targetLayout?: { x: number; y: number; width: number; height: number } | null;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

const TOOLTIP_MAX_WIDTH = 340;
const TOOLTIP_FALLBACK_HEIGHT = 168;
const TOOLTIP_MARGIN = spacing.lg;
const TOOLTIP_GAP = spacing.md;
const SPOTLIGHT_PADDING = 16;

function getHighlightRect(
  target: NonNullable<WalkthroughOverlayProps['targetLayout']>,
  inset?: WalkthroughStepConfig['highlightInset'],
  screenWidth?: number,
  screenHeight?: number,
) {
  const padTop = inset?.top ?? SPOTLIGHT_PADDING;
  const padRight = inset?.right ?? SPOTLIGHT_PADDING;
  const padBottom = inset?.bottom ?? SPOTLIGHT_PADDING;
  const padLeft = inset?.left ?? SPOTLIGHT_PADDING;

  const rect = {
    x: Math.max(0, target.x - padLeft),
    y: Math.max(0, target.y - padTop),
    width: target.width + padLeft + padRight,
    height: target.height + padTop + padBottom,
  };

  if (!screenWidth || !screenHeight) return rect;

  const maxWidth = screenWidth - TOOLTIP_MARGIN * 2;
  const maxHeight = screenHeight - TOOLTIP_MARGIN * 2;
  const width = Math.min(rect.width, maxWidth);
  const height = Math.min(rect.height, maxHeight);
  const x = Math.min(rect.x, Math.max(0, screenWidth - width));
  const y = Math.min(rect.y, Math.max(0, screenHeight - height));

  return { x, y, width, height };
}

function isCircularHighlight(highlight: { width: number; height: number }) {
  const size = Math.max(highlight.width, highlight.height);
  return size <= 72 && Math.abs(highlight.width - highlight.height) <= 12;
}

function getTooltipStyle(
  placement: WalkthroughPlacement,
  highlight: { x: number; y: number; width: number; height: number } | null,
  screenWidth: number,
  screenHeight: number,
  tooltipHeight: number,
): ViewStyle {
  const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, screenWidth - TOOLTIP_MARGIN * 2);
  const left = (screenWidth - tooltipWidth) / 2;

  if (!highlight || placement === 'center') {
    return {
      position: 'absolute',
      top: Math.max(TOOLTIP_MARGIN, screenHeight * 0.22),
      left,
      width: tooltipWidth,
    };
  }

  const spaceAbove = highlight.y - TOOLTIP_MARGIN;
  const spaceBelow = screenHeight - (highlight.y + highlight.height) - TOOLTIP_MARGIN;
  const preferTop =
    placement === 'top' || (placement !== 'bottom' && spaceAbove >= spaceBelow);

  if (preferTop) {
    const top = Math.max(
      TOOLTIP_MARGIN,
      highlight.y - tooltipHeight - TOOLTIP_GAP,
    );
    return {
      position: 'absolute',
      top,
      left,
      width: tooltipWidth,
    };
  }

  const top = Math.min(
    screenHeight - tooltipHeight - TOOLTIP_MARGIN,
    highlight.y + highlight.height + TOOLTIP_GAP,
  );

  return {
    position: 'absolute',
    top,
    left,
    width: tooltipWidth,
  };
}

export function WalkthroughOverlay({
  visible,
  step,
  stepIndex,
  totalSteps,
  targetLayout,
  onNext,
  onPrevious,
  onSkip,
  onFinish,
}: WalkthroughOverlayProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [tooltipHeight, setTooltipHeight] = useState(TOOLTIP_FALLBACK_HEIGHT);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  useEffect(() => {
    setTooltipHeight(TOOLTIP_FALLBACK_HEIGHT);
  }, [step.id, stepIndex]);

  const highlight = useMemo(() => {
    if (!targetLayout || targetLayout.width < 4 || targetLayout.height < 4) return null;
    return getHighlightRect(targetLayout, step.highlightInset, screenWidth, screenHeight);
  }, [targetLayout, step.highlightInset, screenWidth, screenHeight]);

  const tooltipStyle = getTooltipStyle(
    step.placement ?? (highlight ? 'bottom' : 'center'),
    highlight,
    screenWidth,
    screenHeight,
    tooltipHeight,
  );

  const spotlightRadius = highlight && isCircularHighlight(highlight)
    ? Math.max(highlight.width, highlight.height) / 2
    : radii.lg;

  if (!visible) return null;

  return (
    <View style={styles.overlay} accessibilityViewIsModal pointerEvents="box-none">
      <View style={styles.backdrop} pointerEvents="box-none">
        {highlight ? (
          <>
            <View style={[styles.dim, styles.dimInteractive, { top: 0, left: 0, right: 0, height: highlight.y }]} />
            <View
              style={[
                styles.dim,
                styles.dimInteractive,
                {
                  top: highlight.y,
                  left: 0,
                  width: highlight.x,
                  height: highlight.height,
                },
              ]}
            />
            <View
              style={[
                styles.dim,
                styles.dimInteractive,
                {
                  top: highlight.y,
                  left: highlight.x + highlight.width,
                  right: 0,
                  height: highlight.height,
                },
              ]}
            />
            <View
              style={[
                styles.dim,
                styles.dimInteractive,
                {
                  top: highlight.y + highlight.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.spotlightRing,
                {
                  top: highlight.y,
                  left: highlight.x,
                  width: highlight.width,
                  height: highlight.height,
                  borderRadius: spotlightRadius,
                },
              ]}
            />
          </>
        ) : (
          <View style={styles.fullDim} pointerEvents="auto" />
        )}

        <View
          style={[styles.tooltip, tooltipStyle]}
          pointerEvents="auto"
          onLayout={(event) => {
            const nextHeight = event.nativeEvent.layout.height;
            if (nextHeight > 0 && Math.abs(nextHeight - tooltipHeight) > 2) {
              setTooltipHeight(nextHeight);
            }
          }}
        >
          <Text style={styles.progress}>
            Step {stepIndex + 1} of {totalSteps}
          </Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.actions}>
            <Pressable onPress={onSkip} hitSlop={8} accessibilityRole="button" style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip Tour</Text>
            </Pressable>

            <View style={styles.navRow}>
              {!isFirst ? (
                <Pressable
                  onPress={onPrevious}
                  style={styles.secondaryBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryBtnText}>Previous</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={isLast ? onFinish : onNext}
                style={styles.primaryBtn}
                accessibilityRole="button"
              >
                <Text style={styles.primaryBtnText}>{isLast ? 'Finish' : 'Next'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    flex: 1,
  },
  fullDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  dim: {
    position: 'absolute',
    backgroundColor: colors.overlay,
  },
  dimInteractive: {
    pointerEvents: 'auto',
  },
  spotlightRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: 'transparent',
  },
  tooltip: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    gap: spacing.md,
  },
  progress: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  actions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  skipBtn: {
    flexShrink: 1,
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: spacing.sm,
  },
  secondaryBtn: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  primaryBtn: {
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  primaryBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

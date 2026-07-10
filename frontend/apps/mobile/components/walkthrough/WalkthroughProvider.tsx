import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { InteractionManager, View, type ViewProps, type ScrollView } from 'react-native';
import { router, usePathname } from 'expo-router';
import type { Role, WalkthroughProgressRecord, WalkthroughStepConfig } from '@piiaura/types';
import {
  getDashboardWalkthroughSteps,
  getModuleWalkthroughSteps,
  ROLE_HOME_ROUTE,
  ROUTES,
} from '@piiaura/constants';
import {
  fetchWalkthroughProgress,
  isModuleWalkthroughComplete,
  markDashboardWalkthroughComplete,
  markModuleWalkthroughComplete,
  useAuth,
} from '@piiaura/hooks';
import { WalkthroughOverlay } from '@piiaura/ui';

interface ActiveTour {
  kind: 'dashboard' | 'module';
  moduleId?: string;
  steps: WalkthroughStepConfig[];
}

interface WalkthroughContextValue {
  role: Role;
  progress: WalkthroughProgressRecord | null;
  isTourActive: boolean;
  registerTarget: (targetId: string, layout: { x: number; y: number; width: number; height: number }) => void;
  unregisterTarget: (targetId: string) => void;
  registerMeasurer: (targetId: string, measure: () => void) => void;
  unregisterMeasurer: (targetId: string) => void;
  registerScrollView: (actions: WalkthroughScrollActions) => () => void;
  remeasureCurrentTarget: () => void;
  remeasureAllTargets: () => void;
  replayDashboardTour: () => void;
  replayModuleTour: (moduleId: string) => void;
  startModuleTour: (moduleId: string) => void;
}

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

const FACULTY_MODULE_ROUTES: Record<string, string> = {
  attendance: ROUTES.FACULTY.ATTENDANCE,
  schedule: ROUTES.FACULTY.SCHEDULE,
  more: ROUTES.FACULTY.MORE,
  leave: ROUTES.FACULTY.LEAVE,
  assignments: ROUTES.FACULTY.ASSIGNMENTS,
  'marks-entry': ROUTES.FACULTY.MARKS_ENTRY,
  'study-material': ROUTES.FACULTY.STUDY_MATERIAL,
  syllabus: ROUTES.FACULTY.SYLLABUS,
  invigilation: ROUTES.FACULTY.INVIGILATION,
  salary: ROUTES.FACULTY.SALARY,
};

const STUDENT_MODULE_ROUTES: Record<string, string> = {
  exams: ROUTES.STUDENT.EXAMS,
  fees: ROUTES.STUDENT.FEES,
  leave: ROUTES.STUDENT.LEAVE,
  notices: ROUTES.STUDENT.NOTICES,
  alerts: ROUTES.STUDENT.ALERTS,
  homework: ROUTES.STUDENT.HOMEWORK,
  learn: ROUTES.STUDENT.LEARN,
  timetable: ROUTES.STUDENT.TIMETABLE,
  attendance: ROUTES.STUDENT.ATTENDANCE,
};

function getModuleWalkthroughRoute(role: Role, moduleId: string): string | null {
  if (role === 'faculty') return FACULTY_MODULE_ROUTES[moduleId] ?? null;
  if (role === 'student') return STUDENT_MODULE_ROUTES[moduleId] ?? null;
  return null;
}

function pathnameMatchesWalkthroughRoute(pathname: string, route: string): boolean {
  const segment = route.split('/').filter(Boolean).pop();
  return segment ? pathname.includes(segment) : false;
}

interface WalkthroughScrollActions {
  scrollToTop: () => void;
  scrollToEnd: () => void;
}

const CHROME_TARGET_MARKERS = ['tab-bar', 'header-profile', 'header-actions'] as const;

function isChromeTarget(targetId: string) {
  return CHROME_TARGET_MARKERS.some((marker) => targetId.includes(marker));
}

interface WalkthroughProviderProps {
  role: Role;
  children: ReactNode;
}

function scheduleMeasure(measure: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(measure);
  });
  setTimeout(measure, 120);
  setTimeout(measure, 320);
}

export function WalkthroughProvider({ role, children }: WalkthroughProviderProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [progress, setProgress] = useState<WalkthroughProgressRecord | null>(null);
  const [activeTour, setActiveTour] = useState<ActiveTour | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [targets, setTargets] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});
  const measurersRef = useRef<Record<string, () => void>>({});
  const scrollActionsRef = useRef<WalkthroughScrollActions | null>(null);
  const dashboardAutoStartedRef = useRef(false);
  const pendingTourRef = useRef<ActiveTour | null>(null);
  const pendingRouteRef = useRef<string | null>(null);

  const getTourRoute = useCallback(
    (tour: ActiveTour): string | null => {
      if (tour.kind === 'dashboard') {
        return ROLE_HOME_ROUTE[role] ?? null;
      }
      if (tour.kind === 'module' && tour.moduleId) {
        return getModuleWalkthroughRoute(role, tour.moduleId);
      }
      return null;
    },
    [role],
  );

  useEffect(() => {
    if (!user?.id) {
      setProgress(null);
      return;
    }

    let cancelled = false;
    fetchWalkthroughProgress(user.id).then((record) => {
      if (!cancelled) setProgress(record);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const registerTarget = useCallback(
    (targetId: string, layout: { x: number; y: number; width: number; height: number }) => {
      setTargets((prev) => ({ ...prev, [targetId]: layout }));
    },
    [],
  );

  const unregisterTarget = useCallback((targetId: string) => {
    setTargets((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  }, []);

  const registerMeasurer = useCallback((targetId: string, measure: () => void) => {
    measurersRef.current[targetId] = measure;
  }, []);

  const unregisterMeasurer = useCallback((targetId: string) => {
    delete measurersRef.current[targetId];
  }, []);

  const registerScrollView = useCallback((actions: WalkthroughScrollActions) => {
    scrollActionsRef.current = actions;
    return () => {
      scrollActionsRef.current = null;
    };
  }, []);

  const remeasureAllTargets = useCallback(() => {
    const measureAll = () => {
      Object.values(measurersRef.current).forEach((measure) => measure());
    };

    InteractionManager.runAfterInteractions(() => {
      scheduleMeasure(measureAll);
    });
    setTimeout(measureAll, 80);
    setTimeout(measureAll, 250);
    setTimeout(measureAll, 500);
  }, []);

  const remeasureCurrentTarget = useCallback(() => {
    const targetId = activeTour?.steps[stepIndex]?.targetId;
    if (!targetId) return;

    const measure = () => {
      measurersRef.current[targetId]?.();
    };

    InteractionManager.runAfterInteractions(() => {
      scheduleMeasure(measure);
    });
    setTimeout(measure, 80);
    setTimeout(measure, 300);
  }, [activeTour, stepIndex]);

  const prepareStep = useCallback(
    (step?: WalkthroughStepConfig) => {
      if (!step?.targetId) return;

      const { targetId } = step;
      if (targetId.includes('alerts') || targetId.includes('activity')) {
        scrollActionsRef.current?.scrollToEnd();
      } else if (isChromeTarget(targetId)) {
        scrollActionsRef.current?.scrollToTop();
      } else if (targetId.includes('dashboard')) {
        scrollActionsRef.current?.scrollToTop();
      }

      remeasureAllTargets();
    },
    [remeasureAllTargets],
  );

  const startTour = useCallback(
    (tour: ActiveTour) => {
      if (!tour.steps.length) return;
      setTargets((prev) => {
        const next: typeof prev = {};
        for (const [id, layout] of Object.entries(prev)) {
          if (isChromeTarget(id)) next[id] = layout;
        }
        return next;
      });
      setActiveTour(tour);
      setStepIndex(0);
      scrollActionsRef.current?.scrollToTop();
      setTimeout(() => prepareStep(tour.steps[0]), 120);
    },
    [prepareStep],
  );

  const beginReplayTour = useCallback(
    (tour: ActiveTour) => {
      const route = getTourRoute(tour);
      if (!route || pathnameMatchesWalkthroughRoute(pathname, route)) {
        startTour(tour);
        return;
      }

      pendingTourRef.current = tour;
      pendingRouteRef.current = route;
      setActiveTour(null);
      setStepIndex(0);
      setTargets((prev) => {
        const next: typeof prev = {};
        for (const [id, layout] of Object.entries(prev)) {
          if (isChromeTarget(id)) next[id] = layout;
        }
        return next;
      });
      router.push(route as never);
    },
    [getTourRoute, pathname, startTour],
  );

  const closeTour = useCallback(
    async (markComplete: boolean) => {
      if (!user?.id || !activeTour) {
        setActiveTour(null);
        setStepIndex(0);
        return;
      }

      if (markComplete) {
        const next =
          activeTour.kind === 'dashboard'
            ? await markDashboardWalkthroughComplete(user.id)
            : activeTour.moduleId
              ? await markModuleWalkthroughComplete(user.id, activeTour.moduleId)
              : progress;
        if (next) setProgress(next);
      }

      setActiveTour(null);
      setStepIndex(0);
    },
    [activeTour, progress, user?.id],
  );

  const replayDashboardTour = useCallback(() => {
    beginReplayTour({
      kind: 'dashboard',
      steps: getDashboardWalkthroughSteps(role),
    });
  }, [beginReplayTour, role]);

  const replayModuleTour = useCallback(
    (moduleId: string) => {
      beginReplayTour({
        kind: 'module',
        moduleId,
        steps: getModuleWalkthroughSteps(role, moduleId),
      });
    },
    [beginReplayTour, role],
  );

  const startModuleTour = useCallback(
    (moduleId: string) => {
      if (isModuleWalkthroughComplete(progress, moduleId)) return;
      startTour({
        kind: 'module',
        moduleId,
        steps: getModuleWalkthroughSteps(role, moduleId),
      });
    },
    [progress, role, startTour],
  );

  useEffect(() => {
    if (!user?.id || !progress || dashboardAutoStartedRef.current) return;
    if (progress.hasCompletedWalkthrough) return;
    if (!pathname.includes('/dashboard')) return;

    dashboardAutoStartedRef.current = true;
    const timer = setTimeout(() => {
      startTour({
        kind: 'dashboard',
        steps: getDashboardWalkthroughSteps(role),
      });
    }, 900);

    return () => clearTimeout(timer);
  }, [pathname, progress, role, startTour, user?.id]);

  useEffect(() => {
    const pendingTour = pendingTourRef.current;
    const pendingRoute = pendingRouteRef.current;
    if (!pendingTour || !pendingRoute) return;
    if (!pathnameMatchesWalkthroughRoute(pathname, pendingRoute)) return;

    pendingTourRef.current = null;
    pendingRouteRef.current = null;

    const timer = setTimeout(() => {
      startTour(pendingTour);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname, startTour]);

  const currentStep = activeTour?.steps[stepIndex];
  const targetLayout = currentStep?.targetId ? targets[currentStep.targetId] : null;

  useEffect(() => {
    if (!activeTour || !currentStep?.targetId) return;
    prepareStep(currentStep);
  }, [activeTour, currentStep, prepareStep]);

  const goToStep = useCallback((nextIndex: number) => {
    setStepIndex(nextIndex);
  }, []);

  const contextValue = useMemo<WalkthroughContextValue>(
    () => ({
      role,
      progress,
      isTourActive: Boolean(activeTour),
      registerTarget,
      unregisterTarget,
      registerMeasurer,
      unregisterMeasurer,
      registerScrollView,
      remeasureCurrentTarget,
      remeasureAllTargets,
      replayDashboardTour,
      replayModuleTour,
      startModuleTour,
    }),
    [
      activeTour,
      progress,
      registerTarget,
      registerMeasurer,
      registerScrollView,
      remeasureCurrentTarget,
      remeasureAllTargets,
      replayDashboardTour,
      replayModuleTour,
      role,
      startModuleTour,
      unregisterTarget,
      unregisterMeasurer,
    ],
  );

  return (
    <WalkthroughContext.Provider value={contextValue}>
      <View style={{ flex: 1 }}>
        {children}
        {activeTour && currentStep ? (
          <WalkthroughOverlay
            visible
            step={currentStep}
            stepIndex={stepIndex}
            totalSteps={activeTour.steps.length}
            targetLayout={targetLayout}
            onNext={() => goToStep(Math.min(stepIndex + 1, activeTour.steps.length - 1))}
            onPrevious={() => goToStep(Math.max(stepIndex - 1, 0))}
            onSkip={() => closeTour(true)}
            onFinish={() => closeTour(true)}
          />
        ) : null}
      </View>
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const context = useContext(WalkthroughContext);
  if (!context) {
    throw new Error('useWalkthrough must be used within WalkthroughProvider');
  }
  return context;
}

interface WalkthroughTargetProps extends ViewProps {
  id: string;
  children: ReactNode;
}

export function WalkthroughTarget({ id, children, style, ...rest }: WalkthroughTargetProps) {
  const context = useContext(WalkthroughContext);
  const viewRef = useRef<View>(null);

  const measure = useCallback(() => {
    if (!context) return;
    viewRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 2 && height > 2 && Number.isFinite(x) && Number.isFinite(y)) {
        context.registerTarget(id, { x, y, width, height });
      }
    });
  }, [context, id]);

  useEffect(() => {
    if (!context) return;
    context.registerMeasurer(id, measure);
    scheduleMeasure(measure);
    return () => {
      context.unregisterMeasurer(id);
      context.unregisterTarget(id);
    };
  }, [context, id, measure]);

  if (!context) {
    return (
      <View style={style} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <View ref={viewRef} onLayout={() => scheduleMeasure(measure)} style={style} collapsable={false} {...rest}>
      {children}
    </View>
  );
}

export function useWalkthroughScrollRef() {
  const context = useContext(WalkthroughContext);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!context) return;
    return context.registerScrollView({
      scrollToTop: () => scrollRef.current?.scrollTo({ y: 0, animated: false }),
      scrollToEnd: () => scrollRef.current?.scrollToEnd({ animated: false }),
    });
  }, [context]);

  return scrollRef;
}

export function useModuleWalkthrough(moduleId: string) {
  const { progress, isTourActive, startModuleTour } = useWalkthrough();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!progress || isTourActive || startedRef.current) return;
    if (isModuleWalkthroughComplete(progress, moduleId)) return;

    startedRef.current = true;
    const timer = setTimeout(() => startModuleTour(moduleId), 600);
    return () => clearTimeout(timer);
  }, [isTourActive, moduleId, progress, startModuleTour]);
}

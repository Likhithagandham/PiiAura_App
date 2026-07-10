"use client";

import { Joyride, ACTIONS, EVENTS, STATUS, type CallBackProps } from "react-joyride";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@eduos/hooks";
import { usePathname } from "next/navigation";
import { useWalkthroughs } from "./WalkthroughContext";
import { dashboardWalkthroughKey, moduleWalkthroughKey } from "./walkthrough-keys";
import { getDashboardSteps, getModuleSteps } from "./tour-steps";

export function WalkthroughRunner() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { ready, completed, activeTour, startTour, stopTour, markCompleted } = useWalkthroughs();
  const [run, setRun] = useState(false);

  const { steps, completionKey } = useMemo(() => {
    if (!user || !activeTour) return { steps: [], completionKey: null as string | null };
    if (activeTour.kind === "dashboard") {
      return { steps: getDashboardSteps(activeTour.role), completionKey: dashboardWalkthroughKey(activeTour.role) };
    }
    return {
      steps: getModuleSteps(activeTour.role, activeTour.moduleId),
      completionKey: moduleWalkthroughKey(activeTour.role, activeTour.moduleId),
    };
  }, [activeTour, user]);

  // Whenever a tour becomes active (manual replay or module trigger), start it.
  useEffect(() => {
    if (activeTour) setRun(true);
  }, [activeTour]);

  // Auto-start dashboard tour only on first dashboard visit per role.
  useEffect(() => {
    if (!user || !ready) return;
    const dashKey = dashboardWalkthroughKey(user.role);
    const isDashboard = pathname === `/` || pathname.includes("/dashboard");
    if (isDashboard && !completed.has(dashKey) && !activeTour) {
      startTour({ kind: "dashboard", role: user.role });
    }
  }, [user, ready, completed, pathname, activeTour, startTour]);

  const shouldRun = Boolean(activeTour) && steps.length > 0 && run;

  function handle(cb: CallBackProps) {
    if (!activeTour) return;

    if (cb.type === EVENTS.TOUR_START) {
      setRun(true);
      return;
    }

    const finished =
      cb.status === STATUS.FINISHED ||
      cb.status === STATUS.SKIPPED ||
      (cb.type === EVENTS.STEP_AFTER && cb.action === ACTIONS.CLOSE);

    if (finished) {
      // Skip counts as completed so it never auto-starts again.
      if (completionKey) void markCompleted(completionKey);
      setRun(false);
      stopTour();
    }
  }

  if (!user) return null;

  return (
    <Joyride
      steps={steps}
      run={shouldRun}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      spotlightClicks
      scrollToFirstStep
      styles={{
        options: {
          zIndex: 9999,
          arrowColor: "#fff",
          backgroundColor: "#fff",
          overlayColor: "rgba(0,0,0,0.55)",
          primaryColor: "#1a5f4a",
          textColor: "#111827",
        },
      }}
      callback={handle}
    />
  );
}


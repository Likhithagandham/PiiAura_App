import type { PlatformTrialPipelineStage } from "@eduos/types";

const LABEL: Record<PlatformTrialPipelineStage, string> = {
  active: "Active trial",
  grace: "Grace period",
  lapsed: "Ready to deactivate",
};

const CLASS: Record<PlatformTrialPipelineStage, string> = {
  active: "eduos-platform-trial eduos-platform-trial--active",
  grace: "eduos-platform-trial eduos-platform-trial--grace",
  lapsed: "eduos-platform-trial eduos-platform-trial--lapsed",
};

export function PlatformTrialStageTag({ stage }: { stage: PlatformTrialPipelineStage }) {
  return <span className={CLASS[stage]}>{LABEL[stage]}</span>;
}

import type { ReactNode } from 'react';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

interface ModuleWalkthroughScreenProps {
  moduleId: string;
  children: ReactNode;
}

export function ModuleWalkthroughScreen({ moduleId, children }: ModuleWalkthroughScreenProps) {
  useModuleWalkthrough(moduleId);
  return <>{children}</>;
}

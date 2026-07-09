import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function StudentAttendanceScreen() {
  useModuleWalkthrough('attendance');
  return <ScreenPlaceholder title="Attendance" role="student" />;
}

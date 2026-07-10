import { Redirect } from 'expo-router';
import { ROUTES } from '@piiaura/constants';

export default function StudentAnnouncementsScreen() {
  return <Redirect href={ROUTES.STUDENT.NOTICES} />;
}

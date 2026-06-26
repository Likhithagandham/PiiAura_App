import type { FacultySettingsData } from '@piiaura/types';

export const mockFacultySettingsData: FacultySettingsData = {
  name: 'Kavitha Rao',
  subtitle: 'Senior Faculty • Greenfield Academy',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDVx69djpqzgfK-k1ptKs40sIcV2XUwrgq9ms4zOt3bvsOqIH_3NP5FP7RbEHzoKmlvgfYTgY5TUr7xHzPCNs5QQ7F3oLjbea6NLz3dLjrw0oHpGQ96cIJrplGqjdTdkMQIM0Ftx1grBP4l7Iciin0z3zfZ4GurkAnVBZ_Wqp47mCM3TV-sIOTGSUXjCp7uyT-LY5wC0urbNpWN91k2L0cdP4vmxdVoS61S7PZhvUHsyY1J6qKSIZhYaxVFVTlJWun8hjGIR-B1iXp9',
  headerAvatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBKV_mBD6fo6pTxyxjaGCV65n1XbAZMRSy9DbSPWOx49MhLFNumYoZXvaIpBaDv_kBDulZnzjcOuk8QL0VL0bK5vbAxUxtG_j8D6q2UWLxGJ6zNTqNLvqkeUmKROh1L-Vx3wwtfQfXbocwqDPwU0sTc2YB0htf1mZsI4Xs_pcJqsgXIpobqEMrw9zcEJXxkhl4X7BQlJWXkaVAB_UWYc64R9F0z3sPZ6TJBvMbA7I8LqcOxtlQV-ywixbhC4ipgzIAh73dFnY-zch8U',
  employeeIdLabel: 'ID: FA-2024-08',
  notificationsTitle: 'Notification Preferences',
  preferences: [
    {
      id: 'in-app',
      title: 'In-app Notifications',
      description: 'Real-time alerts within the PiiAura portal',
      enabled: true,
    },
    {
      id: 'sms',
      title: 'SMS Alerts',
      description: 'Critical updates sent to your phone',
      enabled: false,
    },
    {
      id: 'email',
      title: 'Email Digest',
      description: 'Daily summary of leave and assignments',
      enabled: true,
    },
  ],
  saveLabel: 'Save Preferences',
  saveFootnote: 'Changes will take effect within 24 hours.',
  privacyTitle: 'Privacy Control',
  privacyDescription:
    'Manage your data visibility to other faculty members and administrators in the system settings.',
};

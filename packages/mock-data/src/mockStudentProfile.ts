import type { StudentProfileData } from '@piiaura/types';

export const mockStudentProfileData: StudentProfileData = {
  name: 'Aarav Patel',
  rollLabel: 'Roll No: CS21B045',
  programBadge: 'B.Tech CSE - Year 3',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDxKqUgs5n0rGiYEhuesGK4K8qUI9x9k-1Xl1qUltAXb3otXNvbVK43g44Fe3f7jrQzIhdjeqmA65ulA1wttwLLe8j5yfESzMxYCOEScpHZuEVs75Lv4ptLb7FHq7W-x2z9CCE5D18o4-83SWhApcPtpYrRrth-v1Y8ZA9drR1ZmiDMPL3l-cf8ugdQmlQJHaF0pav1-WgihuBhKOB9k_MiRjXHcOz3qAsSKqdyjRE0fovUpO1Fa5fRDxBYOPPTL1vc8nH-SUEJREFt',
  personalSectionTitle: 'Personal Details',
  personalFields: [
    { id: 'full-name', label: 'Full Name', value: 'Aarav Patel', inputType: 'text' },
    { id: 'roll-number', label: 'Roll Number', value: 'CS21B045', inputType: 'text' },
    { id: 'admission-number', label: 'Admission Number', value: 'CS21B045', inputType: 'text' },
    { id: 'program', label: 'Program', value: 'B.Tech CSE - Year 3', inputType: 'text' },
    { id: 'class', label: 'Class', value: 'BCS III', inputType: 'text' },
    {
      id: 'email',
      label: 'Email Address',
      value: 'student@piiaura.edu',
      inputType: 'email',
    },
    { id: 'phone', label: 'Phone Number', value: '+91 98765 43210', inputType: 'tel' },
  ],
  securitySectionTitle: 'Security & Preferences',
  securityItems: [
    { id: 'password', label: 'Change Password', type: 'action' },
    { id: 'push-notifications', label: 'Push Notifications', type: 'toggle', defaultEnabled: true },
    {
      id: 'email-attendance-alerts',
      label: 'Email Attendance Alerts',
      type: 'toggle',
      defaultEnabled: false,
    },
  ],
  saveLabel: 'Save Changes',
  lastUpdatedLabel: 'Last updated: Oct 24, 2023',
};

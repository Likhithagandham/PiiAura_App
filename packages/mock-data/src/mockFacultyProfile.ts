import type { FacultyProfileData } from '@piiaura/types';

export const mockFacultyProfileData: FacultyProfileData = {
  name: 'Kavitha Rao',
  designation: 'Senior Faculty, Mathematics',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBToOIVZdB8C2eYsaMBIVxwhx3rLB7h_c01WbtjSR4qOo2i2KxK1Zz5YUusI895J1N1xZIyqrN7pXWO1mavCKjArY3tKwae6CHpE7GH7-CETYus6jUgwdl68jf6zGGVN0RZqtKydmudJ3jO5efkCS9FCAn8tcS56uzumwftNrEnz5yrA8dYE6wqpcPHuhjK4vsTK8ta8D3qEiUw6GBEvu6IskxentSJWc3WTE8wVc2kLpPbRW564KOcks5jbpxFIgHKWuy6OZuJX9LI',
  verified: true,
  badges: [
    { id: 'active', label: 'Active', variant: 'primary' },
    { id: 'permanent', label: 'Permanent', variant: 'secondary' },
  ],
  personalInfo: {
    id: 'personal',
    title: 'Personal Information',
    fields: [
      { label: 'Email Address', value: 'kavitha.rao@faculty.edu.in' },
      { label: 'Phone Number', value: '+91 98450 12345' },
      { label: 'Date of Birth', value: '14 May 1978' },
      { label: 'Gender', value: 'Female' },
    ],
  },
  workInfo: {
    id: 'work',
    title: 'Work Information',
    fields: [
      { label: 'Employee ID', value: 'FAC-2024-089', emphasized: true },
      { label: 'Department', value: 'School of Mathematical Sciences' },
      { label: 'Joining Date', value: '10 January 2018' },
      { label: 'Reporting Manager', value: 'Dr. Rajesh Kumar' },
    ],
  },
  attendance: {
    label: 'Monthly Attendance',
    percent: 94.5,
    periodLabel: 'This Semester',
  },
  accountSettingsLabel: 'Account Settings',
  settings: [
    { id: 'password', label: 'Change Password' },
    { id: 'notifications', label: 'Notification Preferences' },
  ],
  logoutLabel: 'Logout',
};

import type { StudentNoticesData } from '@piiaura/types';

const TECHFEST_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB1pMr3j9ppYHBsnt0l0HlIb0N_jULcWcaMb7pD92lZE_dw2o65ezHl_DvMkrvyA45rPt1udau1ddDxty3JRc1qlbA8yb2cY9CpyHCBDMyCPYHH0V_tzwQgdMZ9mvBpvfGHXqlgUSQED4vGOYVM60cWYRt-LghdLgpv_rUiuzJgH29FCcVskew_EIo941QmJg1YjAk64-AlcYOINJhvNGMB7PSNwY1CSpZ5XjpqLnw5W5Bt8OBNdUskfl19U-ioR4T_E2l8QX8gIKS0';

export const mockStudentNoticesData: StudentNoticesData = {
  title: 'Notices',
  description: 'Campus bulletins, exam updates, and official announcements.',
  categories: [
    { id: 'all', label: 'All Notices' },
    { id: 'academic', label: 'Academic' },
    { id: 'events', label: 'Events' },
    { id: 'administrative', label: 'Administrative' },
  ],
  notices: [
    {
      id: 'notice-2',
      category: 'academic',
      categoryLabel: 'Academic',
      dateLabel: 'Oct 23, 2023',
      title: 'Revised Exam Schedule (Mid-Term)',
      excerpt:
        'The mid-term examination schedule for Computer Science and Electrical Engineering departments has been updated. Please check the new timings for elective subjects...',
      variant: 'standard',
      ctaLabel: 'Read More',
    },
    {
      id: 'notice-3',
      category: 'events',
      categoryLabel: 'EVENTS',
      dateLabel: 'Oct 20, 2023',
      title: 'TechFest 2024 Registration Open',
      excerpt:
        'Our annual technical symposium returns! Registrations for Hackathon, Robotics, and Guest Lectures are now live. Early bird registration ends this Sunday.',
      variant: 'event',
      ctaLabel: 'Register Now',
      imageUrl: TECHFEST_IMAGE,
    },
    {
      id: 'notice-4',
      category: 'administrative',
      categoryLabel: 'Administrative',
      dateLabel: 'Oct 18, 2023',
      title: 'Campus-wide Network Maintenance',
      excerpt:
        'Please be advised that the campus Wi-Fi and ERP portal will be down for scheduled maintenance on Sunday, Oct 27th from 02:00 AM to 06:00 AM.',
      variant: 'administrative',
      ctaLabel: 'Read More',
    },
  ],
  loadMoreLabel: 'Load More Notices',
};

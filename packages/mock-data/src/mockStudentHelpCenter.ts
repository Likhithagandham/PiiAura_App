import type { StudentHelpCenterData } from '@piiaura/types';

export const mockStudentHelpCenterData: StudentHelpCenterData = {
  title: 'Help Center',
  description:
    'Find answers to common questions, reach the right campus team, or raise a support ticket for portal issues.',
  faqSectionTitle: 'Frequently Asked Questions',
  faqs: [
    {
      id: 'faq-login',
      question: 'How do I reset my student portal password?',
      answer:
        'Go to More → Account → Change Password, or contact IT Support with your roll number. Temporary passwords expire after 24 hours.',
    },
    {
      id: 'faq-fees',
      question: 'Where can I pay fees and download receipts?',
      answer:
        'Open More → Fees to view your balance, pay via Quick Pay, and download receipts from Payment History.',
    },
    {
      id: 'faq-leave',
      question: 'How do I apply for leave?',
      answer:
        'Go to More → Leave, fill in the dates, leave type, and reason, then submit your request. Track status under My Requests.',
    },
    {
      id: 'faq-assignments',
      question: 'How do I submit an assignment?',
      answer:
        'Open Learn → Assignments, pick the pending item, choose your file, and tap Submit. Supported formats include PDF and Word documents.',
    },
    {
      id: 'faq-attendance',
      question: 'My attendance percentage looks incorrect',
      answer:
        'Attendance syncs within 24 hours of each session. If the issue persists after a week, raise a ticket with the subject name and date.',
    },
  ],
  contactSectionTitle: 'Contact Support',
  contacts: [
    {
      id: 'it',
      label: 'IT Helpdesk',
      value: 'it.support@greenfield.edu.in',
      hint: 'Portal login, app issues, device access',
    },
    {
      id: 'academic',
      label: 'Academic Office',
      value: '+91 80 4012 7700',
      hint: 'Timetable, exams, transcripts, leave queries',
    },
    {
      id: 'fees',
      label: 'Accounts & Fees',
      value: 'fees@greenfield.edu.in',
      hint: 'Fee payments, receipts, scholarships',
    },
    {
      id: 'hours',
      label: 'Support Hours',
      value: 'Mon–Sat, 8:00 AM – 6:00 PM',
      hint: 'Excluding public holidays',
    },
  ],
  quickLinksTitle: 'Quick Links',
  quickLinks: [
    {
      id: 'guide',
      label: 'Student Portal User Guide',
      description: 'Step-by-step walkthrough for all modules',
    },
    {
      id: 'handbook',
      label: 'Student Handbook',
      description: 'Code of conduct, attendance, and exam rules',
    },
    {
      id: 'status',
      label: 'System Status',
      description: 'Check for scheduled maintenance or outages',
    },
  ],
  submitTicketLabel: 'Raise Support Ticket',
  submitTicketFootnote: 'Typical response time: within 1 business day.',
};

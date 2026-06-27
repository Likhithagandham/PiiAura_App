import type { FacultyHelpSupportData } from '@piiaura/types';

export const mockFacultyHelpSupportData: FacultyHelpSupportData = {
  title: 'Help & Support',
  description:
    'Find answers to common questions, contact the right team, or raise a support ticket for portal issues.',
  faqSectionTitle: 'Frequently Asked Questions',
  faqs: [
    {
      id: 'faq-login',
      question: 'How do I reset my faculty portal password?',
      answer:
        'Go to Account Settings → Change Password, or contact IT Support with your employee ID. Temporary passwords expire after 24 hours.',
    },
    {
      id: 'faq-attendance',
      question: 'Attendance was submitted but still shows pending',
      answer:
        'Sync can take up to 30 minutes. If it remains pending after a class period, raise a ticket with the session date and class section.',
    },
    {
      id: 'faq-leave',
      question: 'How do I approve student leave requests?',
      answer:
        'Open My Leave, switch to the Student Requests tab, and approve or reject each pending request. You will receive an alert when new requests arrive.',
    },
    {
      id: 'faq-salary',
      question: 'My salary slip is missing for this month',
      answer:
        'Payroll is published by the 5th of each month. If your slip is still unavailable, use My Salary → Notify accounts team or contact HR below.',
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
      id: 'hr',
      label: 'HR & Payroll',
      value: '+91 80 4012 8800',
      hint: 'Leave balance, salary slips, employment records',
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
      label: 'Faculty Portal User Guide',
      description: 'Step-by-step walkthrough for all modules',
    },
    {
      id: 'policy',
      label: 'Academic Policies',
      description: 'Attendance, grading, and syllabus guidelines',
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

import type { FacultySalaryData } from '@piiaura/types';

export const mockFacultySalaryData: FacultySalaryData = {
  netPayableLabel: 'Net Payable',
  netPayableValue: '₹ --',
  lastProcessedLabel: 'Last Processed',
  lastProcessedValue: 'Sep 2023',
  salarySlipTitle: 'Salary Slip',
  historyLabel: 'History',
  monthLabel: 'Select Month',
  defaultMonthId: 'oct-2023',
  months: [
    { id: 'oct-2023', label: 'October 2023' },
    { id: 'nov-2023', label: 'November 2023' },
    { id: 'dec-2023', label: 'December 2023' },
  ],
  payrollError: {
    title: 'Payroll not processed',
    descriptionTemplate:
      'The salary slip for {month} has not been finalized by the accounts department yet.',
    notifyLabel: 'Notify Accounts',
  },
  documentsSectionTitle: 'Form 16 & PF',
  documents: [
    {
      id: 'form-16',
      title: 'Form 16',
      subtitle: 'FY 2022-23 • PDF',
      variant: 'form16',
      actions: ['download'],
    },
    {
      id: 'pf-statement',
      title: 'PF Statement',
      subtitle: 'Annual Summary • XLSX',
      variant: 'pf',
      actions: ['share', 'download'],
    },
  ],
  support: {
    title: 'Discrepancy in salary?',
    description: 'Please raise a ticket with the HR department for any adjustments.',
    actionLabel: 'Raise Support Ticket',
  },
};

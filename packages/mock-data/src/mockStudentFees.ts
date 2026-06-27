import type { StudentFeesData } from '@piiaura/types';

export const mockStudentFeesData: StudentFeesData = {
  banner: {
    badgeLabel: 'Fee Management Portal',
    sessionTitle: 'Academic Session 2023-24',
  },
  balanceSummary: {
    paidPercent: 25,
    paidLabel: 'PAID',
    progressLabel: 'Payment Progress',
    totalDueLabel: 'Total Due',
    totalDueAmount: '₹47,500',
    balanceDueLabel: 'Balance Due',
    balanceDueAmount: '₹35,500',
  },
  balanceDetailsTitle: 'Balance Summary',
  balanceDetail: {
    paidAmountLabel: 'Paid Amount',
    paidAmount: '₹12,000',
    nextInstallmentLabel: 'Next Installment',
    nextInstallmentDate: 'Oct 15, 2023',
  },
  quickPay: {
    title: 'Quick Pay (Razorpay)',
    amountLabel: 'Payment Amount (₹)',
    defaultAmount: 35500,
    currencyLabel: 'INR',
    payNowLabel: 'Pay now',
    secureLabel: 'Secure encrypted payment',
  },
  paymentHistoryTitle: 'Payment History',
  viewAllLabel: 'View All',
  transactions: [
    {
      id: 'txn-1',
      date: 'Aug 12, 2023',
      status: 'success',
      statusLabel: 'Success',
      transactionId: 'ID: #TXN-9021',
      amount: '₹12,000',
    },
    {
      id: 'txn-2',
      date: 'Jun 05, 2023',
      status: 'completed',
      statusLabel: 'Completed',
      transactionId: 'ID: #TXN-8842',
      amount: '₹5,000',
      dimmed: true,
    },
  ],
  support: {
    message: 'Need help with payments?',
    buttonLabel: 'Contact Support',
  },
};

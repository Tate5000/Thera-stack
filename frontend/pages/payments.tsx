import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../components/auth/AuthGuard';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

// Payments page - accessible to all users with role-specific content
const PaymentsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  // Mock payment data
  const allPayments = [
    {
      id: 'pay1',
      patientName: 'Alice Johnson',
      patientId: 'p1',
      therapistName: 'Dr. Sarah Johnson',
      therapistId: 'doctor1',
      amount: 150.00,
      dueDate: '2025-04-15',
      status: 'upcoming',
      type: 'session',
      description: 'Individual Therapy Session (45 min)',
      sessionDate: '2025-03-25',
      insuranceCoverage: 100.00,
      patientResponsibility: 50.00
    },
    {
      id: 'pay2',
      patientName: 'Robert Smith',
      patientId: 'p2',
      therapistName: 'Dr. Michael Lee',
      therapistId: 'doctor2',
      amount: 200.00,
      dueDate: '2025-04-10',
      status: 'upcoming',
      type: 'session',
      description: 'Initial Assessment (60 min)',
      sessionDate: '2025-03-28',
      insuranceCoverage: 150.00,
      patientResponsibility: 50.00
    },
    {
      id: 'pay3',
      patientName: 'Alice Johnson',
      patientId: 'p1',
      therapistName: 'Dr. Sarah Johnson',
      therapistId: 'doctor1',
      amount: 150.00,
      dueDate: '2025-03-20',
      paidDate: '2025-03-18',
      status: 'paid',
      type: 'session',
      description: 'Individual Therapy Session (45 min)',
      sessionDate: '2025-03-15',
      paymentMethod: 'Credit Card',
      transactionId: 'txn_12345'
    },
    {
      id: 'pay4',
      patientName: 'Emily Davis',
      patientId: 'p3',
      therapistName: 'Dr. Michael Lee',
      therapistId: 'doctor2',
      amount: 300.00,
      dueDate: '2025-03-15',
      status: 'overdue',
      type: 'package',
      description: '3-Session Package',
      sessionDates: ['2025-02-25', '2025-03-04', '2025-03-11']
    },
    {
      id: 'pay5',
      patientName: 'James Wilson',
      patientId: 'p4',
      therapistName: 'Dr. Sarah Johnson',
      therapistId: 'doctor1',
      amount: 25.00,
      dueDate: '2025-03-18',
      paidDate: '2025-03-17',
      status: 'paid',
      type: 'copay',
      description: 'Co-pay for Session',
      sessionDate: '2025-03-17',
      paymentMethod: 'Credit Card',
      transactionId: 'txn_67890'
    }
  ];

  // Filter payments based on user role
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      if (user) {
        // Filter payments based on user role
        let filteredPayments = [];
        
        if (user.role === 'patient') {
          // Patients see only their own payments
          filteredPayments = allPayments.filter(payment => payment.patientId === user.id);
        } else if (user.role === 'doctor') {
          // Doctors see payments for their patients
          filteredPayments = allPayments.filter(payment => payment.therapistId === user.id);
        } else if (user.role === 'admin') {
          // Admins see all payments
          filteredPayments = allPayments;
        }
        
        setPayments(filteredPayments);
      }
      
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [user]);

  // Filter payments based on active tab
  const filteredPayments = payments.filter(payment => {
    if (activeTab === 'all') return true;
    return payment.status === activeTab;
  });

  // Function to make a payment
  const makePayment = (paymentId) => {
    // In a real application, this would open a payment processing form or redirect to a payment gateway
    alert(`Processing payment for ID: ${paymentId}. In a real app, this would connect to a payment provider.`);
  };

  const tabs = [
    { id: 'all', label: 'All Payments' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' }
  ];

  const statusClasses = {
    upcoming: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-gray-600">Manage your payments and billing information</p>
        </div>

        {/* Payment Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Due</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${filteredPayments
                .filter(p => p.status === 'upcoming' || p.status === 'overdue')
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPayments.filter(p => p.status === 'upcoming' || p.status === 'overdue').length} pending payments
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700">Recently Paid</h3>
            <p className="text-3xl font-bold text-green-600">
              ${filteredPayments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPayments.filter(p => p.status === 'paid').length} completed payments
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700">Payment Methods</h3>
            <div className="flex items-center mt-2 space-x-2">
              <div className="bg-gray-100 rounded-md p-2">
                <span className="text-sm">Visa •••• 4242</span>
              </div>
              {user?.role === 'patient' && (
                <button 
                  onClick={() => router.push('/settings#payment-methods')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Manage
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for filtering */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="flex border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No payments found.</p>
              {user?.role === 'patient' && (
                <p className="mt-2">
                  <Link href="/settings#billing" className="text-blue-600 hover:underline">
                    Set up your billing preferences
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {(user?.role === 'doctor' || user?.role === 'admin') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      {(user?.role === 'doctor' || user?.role === 'admin') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.patientName}</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.status === 'paid' ? payment.paidDate : payment.dueDate}
                        {payment.status === 'paid' ? ' (Paid)' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[payment.status]}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/payments/${payment.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          {(payment.status === 'upcoming' || payment.status === 'overdue') && (
                            <button 
                              onClick={() => makePayment(payment.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Pay Now
                            </button>
                          )}
                          {payment.status === 'paid' && payment.type === 'session' && (
                            <button 
                              onClick={() => router.push(`/billing/receipt/${payment.id}`)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default PaymentsPage;
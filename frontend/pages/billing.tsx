import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../components/auth/AuthGuard';
import { useAuth } from '../context/AuthContext';
import RoleGuard from '../components/auth/RoleGuard';

// Superbilling page - only accessible to doctors and admins
const BillingPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data for superbills
  const [superbills, setSuperbills] = useState([
    {
      id: 'sb1',
      patientName: 'Alice Johnson',
      patientId: 'p1',
      sessionDate: '2025-03-20',
      therapistName: 'Dr. Sarah Johnson',
      therapistId: 'doctor1',
      cptCodes: ['90834', '90837'],
      diagnosisCodes: ['F41.1', 'F32.9'],
      amount: 150.00,
      insuranceProvider: 'Blue Cross',
      status: 'pending',
      submittedDate: null,
      claimNumber: null
    },
    {
      id: 'sb2',
      patientName: 'Robert Smith',
      patientId: 'p2',
      sessionDate: '2025-03-19',
      therapistName: 'Dr. Michael Lee',
      therapistId: 'doctor2',
      cptCodes: ['90791'],
      diagnosisCodes: ['F43.1'],
      amount: 200.00,
      insuranceProvider: 'Aetna',
      status: 'submitted',
      submittedDate: '2025-03-20',
      claimNumber: 'CLM-20250320-1234'
    },
    {
      id: 'sb3',
      patientName: 'Emily Davis',
      patientId: 'p3',
      sessionDate: '2025-03-18',
      therapistName: 'Dr. Sarah Johnson',
      therapistId: 'doctor1',
      cptCodes: ['90834'],
      diagnosisCodes: ['F40.10'],
      amount: 125.00,
      insuranceProvider: 'UnitedHealthcare',
      status: 'paid',
      submittedDate: '2025-03-19',
      claimNumber: 'CLM-20250319-5678',
      paidDate: '2025-03-25',
      paidAmount: 100.00
    },
    {
      id: 'sb4',
      patientName: 'James Wilson',
      patientId: 'p4',
      sessionDate: '2025-03-17',
      therapistName: 'Dr. Michael Lee',
      therapistId: 'doctor2',
      cptCodes: ['90837', '90853'],
      diagnosisCodes: ['F33.1'],
      amount: 175.00,
      insuranceProvider: 'Cigna',
      status: 'denied',
      submittedDate: '2025-03-18',
      claimNumber: 'CLM-20250318-9012',
      deniedReason: 'Missing information'
    },
    {
      id: 'sb5',
      patientName: 'Alice Johnson',
      patientId: 'p1',
      sessionDate: '2025-03-15',
      therapistName: 'Dr. Sarah Johnson',
      therapistId: 'doctor1',
      cptCodes: ['90834'],
      diagnosisCodes: ['F41.1'],
      amount: 150.00,
      insuranceProvider: 'Blue Cross',
      status: 'paid',
      submittedDate: '2025-03-16',
      claimNumber: 'CLM-20250316-3456',
      paidDate: '2025-03-22',
      paidAmount: 120.00
    }
  ]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter superbills based on active tab and search term
  const filteredSuperbills = superbills.filter(bill => {
    // Filter by status
    if (activeTab !== 'all' && bill.status !== activeTab) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        bill.patientName.toLowerCase().includes(search) ||
        bill.therapistName.toLowerCase().includes(search) ||
        bill.claimNumber?.toLowerCase().includes(search) ||
        bill.insuranceProvider.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Filter superbills by therapist if user is a doctor
  const userSuperbills = user?.role === 'doctor'
    ? filteredSuperbills.filter(bill => bill.therapistId === user.id)
    : filteredSuperbills;

  // Function to submit a superbill
  const submitSuperbill = (id) => {
    setSuperbills(superbills.map(bill => 
      bill.id === id
        ? {
            ...bill,
            status: 'submitted',
            submittedDate: new Date().toISOString().split('T')[0],
            claimNumber: `CLM-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
          }
        : bill
    ));
  };

  // Function to create a new superbill
  const createSuperbill = () => {
    router.push('/billing/create');
  };

  const tabs = [
    { id: 'all', label: 'All Superbills' },
    { id: 'pending', label: 'Pending' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'paid', label: 'Paid' },
    { id: 'denied', label: 'Denied' }
  ];

  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800'
  };

  return (
    <AuthGuard>
      <RoleGuard roles={['doctor', 'admin']} fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2">You do not have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      }>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Superbilling</h1>
              <p className="text-gray-600">Manage insurance claims and superbills</p>
            </div>
            <button
              onClick={createSuperbill}
              className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create New Superbill
            </button>
          </div>

          {/* Search and filters */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-1/3">
                  <input
                    type="text"
                    placeholder="Search patients, providers, or claim numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Superbills table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading superbills...</p>
              </div>
            ) : userSuperbills.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No superbills found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPT Codes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userSuperbills.map((bill) => (
                      <tr key={bill.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.patientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.sessionDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.insuranceProvider}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.cptCodes.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${bill.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[bill.status]}`}>
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => router.push(`/billing/${bill.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            {bill.status === 'pending' && (
                              <button 
                                onClick={() => submitSuperbill(bill.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Submit
                              </button>
                            )}
                            {bill.status === 'denied' && (
                              <button 
                                onClick={() => router.push(`/billing/${bill.id}/edit`)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Resubmit
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
      </RoleGuard>
    </AuthGuard>
  );
};

export default BillingPage;
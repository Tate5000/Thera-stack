import Link from 'next/link'
import AuthGuard from '../components/auth/AuthGuard'
import { useAuth } from '../context/AuthContext'
import RoleGuard from '../components/auth/RoleGuard'

export default function Home() {
  const { user } = useAuth()

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome to TheraStack</h1>
          {user && (
            <p className="mb-2">Hello, {user.name}! You are logged in as: <span className="font-semibold capitalize">{user.role}</span></p>
          )}
          <p className="text-sm text-gray-600">Your AI-powered therapy platform</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/calendar" className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <span className="text-lg font-medium">Calendar</span>
              <span className="text-sm text-gray-600">Manage your appointments</span>
            </Link>
            
            <Link href="/documents" className="bg-amber-100 hover:bg-amber-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <span className="text-lg font-medium">Documents</span>
              <span className="text-sm text-gray-600">Patient records & files</span>
            </Link>
            
            <Link href="/sessions" className="bg-purple-100 hover:bg-purple-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <span className="text-lg font-medium">Therapy Sessions</span>
              <span className="text-sm text-gray-600">Access your sessions</span>
            </Link>
            
            <Link href="/messages" className="bg-indigo-100 hover:bg-indigo-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <span className="text-lg font-medium">Messages</span>
              <span className="text-sm text-gray-600">Secure communication</span>
            </Link>
            
            {/* Superbilling - visible only to doctors and admins */}
            {user && (user.role === 'doctor' || user.role === 'admin') && (
              <Link href="/billing" className="bg-teal-100 hover:bg-teal-200 p-4 rounded-lg flex flex-col items-center justify-center">
                <span className="text-lg font-medium">Superbilling</span>
                <span className="text-sm text-gray-600">Manage insurance claims</span>
              </Link>
            )}
            
            {/* Payments - visible to all users */}
            <Link href="/payments" className="bg-emerald-100 hover:bg-emerald-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <span className="text-lg font-medium">Payments</span>
              <span className="text-sm text-gray-600">Manage transactions</span>
            </Link>
            
            {user && user.role === 'admin' && (
              <Link href="/admin" className="bg-orange-100 hover:bg-orange-200 p-4 rounded-lg flex flex-col items-center justify-center">
                <span className="text-lg font-medium">Admin Dashboard</span>
                <span className="text-sm text-gray-600">Manage system settings</span>
              </Link>
            )}
            
            <Link href="/assistant" className="bg-green-100 hover:bg-green-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <span className="text-lg font-medium">AI Assistant</span>
              <span className="text-sm text-gray-600">Get therapy assistance</span>
            </Link>
          </div>
        </div>
        
        {/* Role-specific content sections */}
        {user && (
          <>
            <RoleGuard roles="patient">
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Patient Dashboard</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium">Upcoming Appointments</h3>
                    <p className="text-sm text-gray-600">Your next therapy session is scheduled for tomorrow at 2:00 PM</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium">Recent Documents</h3>
                    <p className="text-sm text-gray-600">Your therapist has shared new exercises for your review</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium">Messages</h3>
                    <p className="text-sm text-gray-600">You have unread messages from your healthcare team</p>
                    <Link href="/messages" className="text-sm text-indigo-600 font-medium hover:underline mt-2 inline-block">
                      View messages →
                    </Link>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-medium">Payments</h3>
                    <p className="text-sm text-gray-600">Your next payment is scheduled for April 15th</p>
                    <Link href="/payments" className="text-sm text-emerald-600 font-medium hover:underline mt-2 inline-block">
                      View payment history →
                    </Link>
                  </div>
                </div>
              </div>
            </RoleGuard>
            
            <RoleGuard roles="doctor">
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Therapist Dashboard</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium">Today's Schedule</h3>
                    <p className="text-sm text-gray-600">You have 5 patient appointments scheduled today</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-medium">Patient Updates</h3>
                    <p className="text-sm text-gray-600">3 patients have submitted progress reports</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium">Patient Messages</h3>
                    <p className="text-sm text-gray-600">2 new messages from patients require your attention</p>
                    <Link href="/messages" className="text-sm text-indigo-600 font-medium hover:underline mt-2 inline-block">
                      Respond to messages →
                    </Link>
                  </div>
                  
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-medium">Superbilling</h3>
                    <p className="text-sm text-gray-600">5 insurance claims pending submission</p>
                    <Link href="/billing" className="text-sm text-teal-600 font-medium hover:underline mt-2 inline-block">
                      Manage claims →
                    </Link>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-medium">Payments</h3>
                    <p className="text-sm text-gray-600">3 payments received in the last week</p>
                    <Link href="/payments" className="text-sm text-emerald-600 font-medium hover:underline mt-2 inline-block">
                      View payment dashboard →
                    </Link>
                  </div>
                </div>
              </div>
            </RoleGuard>
            
            <RoleGuard roles="admin">
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">System Status</h2>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium">All Services Operational</h3>
                    <p className="text-sm text-gray-600">AWS resources and APIs are functioning normally</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium">User Activity</h3>
                    <p className="text-sm text-gray-600">25 active users in the last hour</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium">Message System</h3>
                    <p className="text-sm text-gray-600">Platform-wide messaging activity: 78 new messages today</p>
                    <Link href="/messages" className="text-sm text-indigo-600 font-medium hover:underline mt-2 inline-block">
                      Manage messages →
                    </Link>
                  </div>
                  
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-medium">Superbilling System</h3>
                    <p className="text-sm text-gray-600">42 claims processed, 15 pending review</p>
                    <Link href="/billing" className="text-sm text-teal-600 font-medium hover:underline mt-2 inline-block">
                      Manage superbilling →
                    </Link>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-medium">Payment System</h3>
                    <p className="text-sm text-gray-600">Platform-wide payment activity: $5,280 processed this week</p>
                    <Link href="/payments" className="text-sm text-emerald-600 font-medium hover:underline mt-2 inline-block">
                      View payment analytics →
                    </Link>
                  </div>
                </div>
              </div>
            </RoleGuard>
          </>
        )}
      </div>
    </AuthGuard>
  )
}
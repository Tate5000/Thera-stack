import React, { useEffect, useState } from 'react';
import { Role } from '../../types/auth';

interface RoleSwitcherProps {
  onChange?: (role: Role) => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onChange }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('patient');

  // On mount, check if there's a preferred role in localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('preferred_role') as Role | null;
    if (savedRole && ['patient', 'doctor', 'admin'].includes(savedRole)) {
      setSelectedRole(savedRole);
    }
  }, []);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    localStorage.setItem('preferred_role', role);
    if (onChange) {
      onChange(role);
    }
  };

  return (
    <div className="w-full p-4 bg-blue-50 rounded-md shadow">
      <h3 className="font-medium text-blue-800 mb-2">SSO User Role</h3>
      <p className="text-sm text-gray-600 mb-3">
        Select which user role to use when logging in with SSO:
      </p>
      <div className="flex flex-col space-y-2">
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio text-blue-600"
            name="role"
            value="patient"
            checked={selectedRole === 'patient'}
            onChange={() => handleRoleChange('patient')}
          />
          <span className="ml-2">Patient</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio text-blue-600"
            name="role" 
            value="doctor"
            checked={selectedRole === 'doctor'}
            onChange={() => handleRoleChange('doctor')}
          />
          <span className="ml-2">Doctor/Therapist</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio text-blue-600"
            name="role"
            value="admin"
            checked={selectedRole === 'admin'}
            onChange={() => handleRoleChange('admin')}
          />
          <span className="ml-2">Admin</span>
        </label>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        This setting only affects SSO logins. For credentials login, use the accounts listed above.
      </div>
    </div>
  );
};

export default RoleSwitcher;
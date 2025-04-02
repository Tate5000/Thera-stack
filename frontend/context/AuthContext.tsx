import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AuthState, User, Permission } from '../types/auth';
import {
  loginWithCredentials,
  loginWithSSO,
  getCurrentSession,
  logout,
  hasPermission,
  ensureUserHasRolePermissions
} from '../services/authService';

// Define the context type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginSSO: (provider: 'google' | 'microsoft' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: Permission) => boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  error: null
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Action types
type AuthAction =
  | { type: 'INITIALIZE'; payload: { user: User | null; token: string | null } }
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        isInitialized: true,
        isLoading: false
      };
    case 'LOGIN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already logged in
        const session = await getCurrentSession();
        
        if (session) {
          // Ensure user has all the required permissions for their role
          const userWithAllPermissions = ensureUserHasRolePermissions(session.user);
          
          // Store in localStorage for persistence
          localStorage.setItem('auth_token', session.token);
          localStorage.setItem('user_id', userWithAllPermissions.id);
          
          dispatch({
            type: 'INITIALIZE',
            payload: {
              user: userWithAllPermissions,
              token: session.token
            }
          });
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              user: null,
              token: null
            }
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            user: null,
            token: null
          }
        });
      }
    };

    initializeAuth();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    try {
      const result = await loginWithCredentials(email, password);
      
      if (result) {
        // Ensure user has all the required permissions for their role
        const userWithAllPermissions = ensureUserHasRolePermissions(result.user);
        
        // Store in localStorage for persistence
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_id', userWithAllPermissions.id);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userWithAllPermissions,
            token: result.token
          }
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: {
            error: 'Invalid credentials'
          }
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: {
          error: 'An error occurred during login'
        }
      });
    }
  };

  // Login with SSO provider
  const loginSSO = async (provider: 'google' | 'microsoft' | 'apple') => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    try {
      const result = await loginWithSSO(provider);
      
      if (result) {
        // Ensure user has all the required permissions for their role
        const userWithAllPermissions = ensureUserHasRolePermissions(result.user);
        
        // Store in localStorage for persistence
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_id', userWithAllPermissions.id);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userWithAllPermissions,
            token: result.token
          }
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: {
            error: `${provider} login failed`
          }
        });
      }
    } catch (error) {
      console.error('SSO login failed:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: {
          error: 'An error occurred during SSO login'
        }
      });
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Check permission
  const can = (permission: Permission): boolean => {
    return state.user ? hasPermission(state.user, permission) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginSSO,
        logout: handleLogout,
        can
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
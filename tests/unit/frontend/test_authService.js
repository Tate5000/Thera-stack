import { describe, it, expect, vi } from 'vitest';
import { login, logout, register, getCurrentUser } from '../../../frontend/services/authService';

// Mock fetch
global.fetch = vi.fn();

describe('authService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('login should call the login API and return user data on success', async () => {
    const mockResponse = {
      status: 200,
      json: () => Promise.resolve({ 
        id: '123', 
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient'
      })
    };
    
    fetch.mockResolvedValueOnce(mockResponse);

    const result = await login('test@example.com', 'password123');
    
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      credentials: 'include'
    });
    
    expect(result).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'patient'
    });
  });

  it('logout should call the logout API', async () => {
    const mockResponse = {
      status: 200,
      json: () => Promise.resolve({ success: true })
    };
    
    fetch.mockResolvedValueOnce(mockResponse);

    await logout();
    
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  });
});
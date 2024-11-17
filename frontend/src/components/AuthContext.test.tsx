import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const TestComponent: React.FC = () => {
  const { token, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="token">{token}</div>
      <button onClick={() => login('test-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides authentication context', () => {
    const { getByTestId, getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('token').textContent).toBe('');

    act(() => {
      getByText('Login').click();
    });

    expect(getByTestId('token').textContent).toBe('test-token');
    expect(localStorage.getItem('token')).toBe('test-token');

    act(() => {
      getByText('Logout').click();
    });

    expect(getByTestId('token').textContent).toBe('');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
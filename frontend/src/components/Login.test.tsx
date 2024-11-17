import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import Login from './Login';
import { toast } from 'react-toastify';

jest.mock('react-toastify');

describe('Login', () => {
  it('renders login form', () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    expect(getByPlaceholderText('Username')).toBeInTheDocument();
    expect(getByPlaceholderText('Password')).toBeInTheDocument();
    expect(getByText('Login')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'test-token' }),
    });

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'testpass' } });
    fireEvent.click(getByText('Login'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully');
    });
  });

  it('handles login failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'testpass' } });
    fireEvent.click(getByText('Login'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Login failed. Please check your credentials.');
    });
  });
});
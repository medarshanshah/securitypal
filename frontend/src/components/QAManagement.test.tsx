import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import QAManagement from './QAManagement';
import { toast } from 'react-toastify';

jest.mock('react-toastify');

describe('QAManagement', () => {
  it('renders QA management interface', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [],
        count: 0
      }),
    });

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <QAManagement />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByPlaceholderText('New question')).toBeInTheDocument();
      expect(getByPlaceholderText('New answer')).toBeInTheDocument();
      expect(getByText('Add Q&A Pair')).toBeInTheDocument();
      expect(getByPlaceholderText('Search Q&A pairs...')).toBeInTheDocument();
    });
  });

  it('handles adding a new QA pair', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <QAManagement />
      </AuthProvider>
    );

    fireEvent.change(getByPlaceholderText('New question'), { target: { value: 'Test question' } });
    fireEvent.change(getByPlaceholderText('New answer'), { target: { value: 'Test answer' } });
    fireEvent.click(getByText('Add Q&A Pair'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Q&A pair added successfully');
    });
  });

  it('handles QA pair fetch failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    render(
      <AuthProvider>
        <QAManagement />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error fetching Q&A pairs. Please try again.');
    });
  });
});
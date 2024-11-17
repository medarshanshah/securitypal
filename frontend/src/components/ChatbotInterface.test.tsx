import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import ChatbotInterface from './ChatbotInterface';
import { toast } from 'react-toastify';

jest.mock('react-toastify');

describe('ChatbotInterface', () => {
  it('renders chatbot interface', () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <ChatbotInterface />
      </AuthProvider>
    );

    expect(getByPlaceholderText('Type your question here...')).toBeInTheDocument();
    expect(getByText('Send')).toBeInTheDocument();
  });

  it('handles successful message send', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        answer: 'Test answer',
        sources: [
          { question: 'Test question', answer: 'Test answer', relevance_score: 0.9 }
        ]
      }),
    });

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <ChatbotInterface />
      </AuthProvider>
    );

    fireEvent.change(getByPlaceholderText('Type your question here...'), { target: { value: 'Test question' } });
    fireEvent.click(getByText('Send'));

    await waitFor(() => {
      expect(getByText('Test answer')).toBeInTheDocument();
      expect(getByText('Relevant Sources:')).toBeInTheDocument();
    });
  });

  it('handles message send failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <ChatbotInterface />
      </AuthProvider>
    );

    fireEvent.change(getByPlaceholderText('Type your question here...'), { target: { value: 'Test question' } });
    fireEvent.click(getByText('Send'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error processing your request. Please try again.');
    });
  });
});
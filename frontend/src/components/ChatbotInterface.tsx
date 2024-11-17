import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface Message {
  text: string;
  isUser: boolean;
}

interface Source {
  question: string;
  answer: string;
  relevance_score: number;
}

export default function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage: Message = { text: data.answer, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setSources(data.sources);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error processing your request. Please try again.');
      const errorMessage: Message = { text: 'Sorry, there was an error processing your request.', isUser: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-grow overflow-y-auto mb-4 p-4 border rounded">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {message.text}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-center">
            <span className="inline-block p-2 rounded bg-gray-200">Thinking...</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow mr-2 p-2 border rounded"
          placeholder="Type your question here..."
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {sources.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Relevant Sources:</h3>
          {sources.map((source, index) => (
            <div key={index} className="mb-2 p-2 border rounded">
              <p><strong>Q: {source.question}</strong></p>
              <p>A: {source.answer}</p>
              <p className="text-sm text-gray-500">Relevance Score: {source.relevance_score.toFixed(4)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
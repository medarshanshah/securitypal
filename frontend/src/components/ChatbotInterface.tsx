import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { Message, Source } from '../types';
import { Transition } from '@headlessui/react';
import { Send, Loader } from 'lucide-react';

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
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-100">
      <div className="flex-grow overflow-y-auto mb-4 p-4 space-y-4">
        {messages.map((message, index) => (
          <Transition
            key={index}
            show={true}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3/4 p-3 rounded-lg ${
                message.isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
              }`}>
                {message.text}
              </div>
            </div>
          </Transition>
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <Loader className="animate-spin text-blue-500" size={24} />
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow mr-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your question here..."
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
          <span className="sr-only">Send</span>
        </button>
      </form>
      {sources.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold mb-2 text-lg">Relevant Sources:</h3>
          <div className="space-y-2">
            {sources.map((source, index) => (
              <Transition
                key={index}
                show={true}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
              >
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="font-semibold">Q: {source.question}</p>
                  <p className="mt-1">A: {source.answer}</p>
                  <p className="text-sm text-gray-500 mt-1">Relevance Score: {source.relevance_score.toFixed(4)}</p>
                </div>
              </Transition>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
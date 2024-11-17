import React, { useState } from 'react';
import ChatbotInterface from './components/ChatbotInterface';
import QAManagement from './components/QAManagement';
import Login from './components/Login';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'chatbot' | 'qa'>('chatbot');
  const { token, logout } = useAuth();

  if (!token) {
    return <Login />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">SecurityPal Q&A System</h1>
      <div className="flex mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'chatbot' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('chatbot')}
        >
          Chatbot
        </button>
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'qa' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('qa')}
        >
          Q&A Management
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={logout}
        >
          Logout
        </button>
      </div>
      {activeTab === 'chatbot' ? <ChatbotInterface /> : <QAManagement />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  );
}
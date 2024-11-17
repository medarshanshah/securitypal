import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface QAPair {
  id: number;
  question: string;
  answer: string;
}

export default function QAManagement() {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchQAPairs();
  }, [currentPage, searchQuery]);

  const fetchQAPairs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/qa-pairs/?page=${currentPage}&search=${searchQuery}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setQaPairs(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (error) {
      console.error('Error fetching Q&A pairs:', error);
      toast.error('Error fetching Q&A pairs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/api/qa-pairs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setNewQuestion('');
      setNewAnswer('');
      fetchQAPairs();
      toast.success('Q&A pair added successfully');
    } catch (error) {
      console.error('Error adding Q&A pair:', error);
      toast.error('Error adding Q&A pair. Please try again.');
    }
  };

  const handleEdit = async (id: number) => {
    if (editingId === id) {
      try {
        const pairToUpdate = qaPairs.find(pair => pair.id === id);
        if (!pairToUpdate) return;

        const response = await fetch(`http://localhost:8000/api/qa-pairs/${id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify(pairToUpdate),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        setEditingId(null);
        fetchQAPairs();
        toast.success('Q&A pair updated successfully');
      } catch (error) {
        console.error('Error updating Q&A pair:', error);
        toast.error('Error updating Q&A pair. Please try again.');
      }
    } else {
      setEditingId(id);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/qa-pairs/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchQAPairs();
      toast.success('Q&A pair deleted successfully');
    } catch (error) {
      console.error('Error deleting Q&A pair:', error);
      toast.error('Error deleting Q&A pair. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Q&A Management</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          placeholder="New question"
        />
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          placeholder="New answer"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add Q&A Pair</button>
      </form>
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Search Q&A pairs..."
        />
      </div>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div>
          {qaPairs.map(pair => (
            <div key={pair.id} className="mb-4 p-4 border rounded">
              <input
                type="text"
                value={pair.question}
                onChange={(e) => setQaPairs(qaPairs.map(p => p.id === pair.id ? { ...p, question: e.target.value } : p))}
                disabled={editingId !== pair.id}
                className="w-full mb-2 p-2 border rounded"
              />
              <textarea
                value={pair.answer}
                onChange={(e) => setQaPairs(qaPairs.map(p => p.id === pair.id ? { ...p, answer: e.target.value } : p))}
                disabled={editingId !== pair.id}
                className="w-full mb-2 p-2 border rounded"
              />
              <button onClick={() => handleEdit(pair.id)} className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded">
                {editingId === pair.id ? 'Save' : 'Edit'}
              </button>
              <button onClick={() => handleDelete(pair.id)} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
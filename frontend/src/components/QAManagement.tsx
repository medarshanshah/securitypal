import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    fetchQAPairs();
  }, []);

  const fetchQAPairs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/qa-pairs/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setQaPairs(data);
    } catch (error) {
      console.error('Error fetching Q&A pairs:', error);
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
        },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setNewQuestion('');
      setNewAnswer('');
      fetchQAPairs();
    } catch (error) {
      console.error('Error adding Q&A pair:', error);
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
          },
          body: JSON.stringify(pairToUpdate),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        setEditingId(null);
        fetchQAPairs();
      } catch (error) {
        console.error('Error updating Q&A pair:', error);
      }
    } else {
      setEditingId(id);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/qa-pairs/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchQAPairs();
    } catch (error) {
      console.error('Error deleting Q&A pair:', error);
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
    </div>
  );
}
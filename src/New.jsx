import { useState } from 'react';
import { apiUrl } from './lib/api.js';

function New({ onItemCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(apiUrl('/api/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create item');
      }

      onItemCreated(result.data);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="new-item">
      <h2>Create Item</h2>
      <form onSubmit={handleSubmit} className="new-form">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter a title"
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional description"
          rows={3}
        />

        {error && <p className="status error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Add Item'}
        </button>
      </form>
    </section>
  );
}

export default New;
